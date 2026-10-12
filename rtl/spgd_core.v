`timescale 1ns / 1ps
// -----------------------------------------------------------------------------
// spgd_core : Stochastic Parallel Gradient Descent controller for coherent beam
// combining (CBC). Two-sided SPGD:
//     u_j <- u_j + G * (J(u + d*s) - J(u - d*s)) * s_j ,   s_j in {+1,-1} random
// u_j are phase-modulator commands (16-bit, 65536 = 2*pi, wraps naturally).
// Channel 0 is the reference (never perturbed) when REF_CH0=1.
// -----------------------------------------------------------------------------
module spgd_core #(
    parameter N        = 8,     // number of beams (2..16)
    parameter DW       = 16,    // DAC / phase width
    parameter AW       = 16,    // photodetector ADC width (unsigned metric)
    parameter AVG_LOG2 = 4,     // samples averaged per measurement = 2^AVG_LOG2
    parameter REF_CH0  = 1
)(
    input  wire                clk,
    input  wire                rst_n,
    input  wire                run,
    input  wire                maximize,       // 1: maximise metric (power in bucket)
    input  wire [DW-1:0]       delta,          // perturbation amplitude (phase LSBs)
    input  wire [4:0]          gain_shift,     // step = dJ >>> gain_shift
    input  wire [15:0]         step_max,       // |step| clamp (phase LSBs)
    input  wire [15:0]         settle_cycles,  // wait after each DAC update
    input  wire [AW-1:0]       lock_thr,
    input  wire [31:0]         seed,
    input  wire                phase_wr_en,    // manual phase write (idle only)
    input  wire [3:0]          phase_wr_idx,
    input  wire [DW-1:0]       phase_wr_data,
    output wire [N*DW-1:0]     dac_data,
    output reg                 dac_update,
    output wire [N*DW-1:0]     phase_flat,     // unperturbed estimate u
    input  wire [AW-1:0]       adc_data,
    input  wire                adc_valid,
    output reg  [AW-1:0]       metric,
    output reg                 locked,
    output reg  [31:0]         iter,
    output wire                busy
);
    localparam SW = AW + AVG_LOG2;

    localparam S_IDLE=4'd0, S_RNG=4'd1, S_PA=4'd2, S_PS=4'd3, S_PACC=4'd4,
               S_MA=4'd5,  S_MS=4'd6,  S_MACC=4'd7, S_UPD=4'd8;
    reg [3:0] st;
    assign busy = (st != S_IDLE);

    reg [DW-1:0] u     [0:N-1];
    reg [DW-1:0] dac_r [0:N-1];
    reg [31:0]   rng;
    reg [N-1:0]  sgn;
    reg [15:0]   cnt;
    reg [AVG_LOG2:0] ncnt;
    reg [SW-1:0] acc, sumP, sumM;

    wire [N-1:0] act = (REF_CH0 != 0) ? {{(N-1){1'b1}},1'b0} : {N{1'b1}};

    genvar g;
    generate for (g=0; g<N; g=g+1) begin : pack
        assign dac_data  [g*DW +: DW] = dac_r[g];
        assign phase_flat[g*DW +: DW] = u[g];
    end endgenerate

    // xorshift32: one call per iteration -> well-mixed sign bits
    wire [31:0] x1 = rng ^ (rng << 13);
    wire [31:0] x2 = x1  ^ (x1 >> 17);
    wire [31:0] x3 = x2  ^ (x2 << 5);

    reg  signed [39:0] dJ, raw, shd, lim_p, lim_n, clp;
    wire [SW:0] sum_ab = {1'b0,sumP} + {1'b0,sumM};

    integer i;
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            st <= S_IDLE; dac_update <= 1'b0; metric <= 0; locked <= 1'b0; iter <= 32'd0;
            rng <= 32'h1; sgn <= 0; cnt <= 0; ncnt <= 0; acc <= 0; sumP <= 0; sumM <= 0;
            for (i=0;i<N;i=i+1) begin u[i] <= 0; dac_r[i] <= 0; end
        end else begin
            dac_update <= 1'b0;
            case (st)
            S_IDLE: begin
                if (phase_wr_en && phase_wr_idx < N) begin
                    u[phase_wr_idx] <= phase_wr_data; dac_r[phase_wr_idx] <= phase_wr_data;
                    dac_update <= 1'b1;
                end
                if (run) begin
                    rng  <= (seed == 32'd0) ? 32'h1 : seed;   // xorshift state must never be 0
                    iter <= 32'd0;
                    st   <= S_RNG;
                end
            end
            S_RNG: begin rng <= x3; sgn <= x3[N-1:0]; st <= S_PA; end

            S_PA, S_MA: begin       // apply u +/- delta*s
                for (i=0;i<N;i=i+1)
                    dac_r[i] <= !act[i]  ? u[i] :
                                ((sgn[i] ^ (st==S_MA)) ? u[i] + delta : u[i] - delta);
                dac_update <= 1'b1;
                cnt <= settle_cycles;
                st  <= (st==S_PA) ? S_PS : S_MS;
            end
            S_PS, S_MS: begin       // settle (modulator + detector latency)
                if (cnt == 0) begin acc <= 0; ncnt <= 0; st <= (st==S_PS) ? S_PACC : S_MACC; end
                else cnt <= cnt - 1'b1;
            end
            S_PACC, S_MACC: begin   // average 2^AVG_LOG2 samples
                if (adc_valid) begin
                    acc  <= acc + adc_data;
                    ncnt <= ncnt + 1'b1;
                    if (ncnt == (1<<AVG_LOG2)-1) begin
                        if (st==S_PACC) begin sumP <= acc + adc_data; st <= S_MA;  end
                        else            begin sumM <= acc + adc_data; st <= S_UPD; end
                    end
                end
            end
            S_UPD: begin
                dJ    = $signed({{(40-SW-1){1'b0}},1'b0,sumP}) - $signed({{(40-SW-1){1'b0}},1'b0,sumM});
                if (!maximize) dJ = -dJ;
                lim_p = {24'd0, step_max};
                lim_n = -lim_p;
                for (i=0;i<N;i=i+1) begin
                    raw = sgn[i] ? dJ : -dJ;
                    shd = raw >>> gain_shift;
                    clp = (shd > lim_p) ? lim_p : (shd < lim_n) ? lim_n : shd;
                    if (act[i]) u[i] <= u[i] + clp[DW-1:0];
                end
                metric <= sum_ab >> (AVG_LOG2+1);
                locked <= maximize ? ((sum_ab >> (AVG_LOG2+1)) >= lock_thr)
                                   : ((sum_ab >> (AVG_LOG2+1)) <= lock_thr);
                iter   <= iter + 1'b1;
                st     <= run ? S_RNG : S_IDLE;
            end
            default: st <= S_IDLE;
            endcase
        end
    end
endmodule
