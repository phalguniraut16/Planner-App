`timescale 1ns / 1ps
// Synthesizable N-beam coherent-combining emulator ("plant") for bring-up without optics.
//   theta_i = phi_i + drift*i + dac_i ;  J = |sum_i exp(j*theta_i)|^2 scaled to AW bits
// phi_i are fixed pseudo-random offsets (unknown to the controller); `drift` emulates drift.
module plant_emu #(
    parameter N = 8, parameter DW = 16, parameter AW = 16, parameter NOISE_BITS = 3
)(
    input  wire              clk,
    input  wire              rst_n,
    input  wire [N*DW-1:0]   dac_data,
    input  wire [15:0]       drift,
    output reg  [AW-1:0]     adc_data,
    output reg               adc_valid
);
    localparam LOGN  = $clog2(N);
    localparam SHIFT = 6 + 2*LOGN;           // (N*2047)^2 ~ 2^(22+2*LOGN) -> 16 bit
    wire signed [11:0] sn [0:N-1];
    wire signed [11:0] cs [0:N-1];
    reg  signed [11:0] sn_r [0:N-1];
    reg  signed [11:0] cs_r [0:N-1];
    genvar g;
    generate for (g=0; g<N; g=g+1) begin : emitter
        wire [15:0] phi   = ((g+1) * 16'h6A3D) ^ 16'h51B7;      // fixed unknown offsets
        wire [15:0] theta = phi + drift*g + dac_data[g*DW +: DW];
        sin_rom rs(.addr(theta[15:6]),           .q(sn[g]));
        sin_rom rc(.addr(theta[15:6] + 10'd256), .q(cs[g]));
        always @(posedge clk) begin sn_r[g] <= sn[g]; cs_r[g] <= cs[g]; end
    end endgenerate

    integer k;
    reg signed [19:0] I, Q;
    reg [39:0] P;
    reg [15:0] nz;
    reg [39:0] jv;
    reg [AW+1:0] jn;
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin P<=0; adc_data<=0; adc_valid<=1'b0; nz<=16'hACE1; end
        else begin
            I = 0; Q = 0;
            for (k=0;k<N;k=k+1) begin I = I + cs_r[k]; Q = Q + sn_r[k]; end
            P  <= I*I + Q*Q;
            nz <= {nz[14:0], nz[15]^nz[13]^nz[12]^nz[10]};
            jv = P >> SHIFT;
            jn = (jv > {AW{1'b1}}) ? {2'b00,{AW{1'b1}}} : jv[AW+1:0];
            if (NOISE_BITS > 0) begin
                jn = jn + nz[NOISE_BITS-1:0];                       // unsigned noise 0..2^NB-1
                jn = (jn > (1<<(NOISE_BITS-1))) ? jn - (1<<(NOISE_BITS-1)) : 0;
            end
            adc_data  <= (jn > {AW{1'b1}}) ? {AW{1'b1}} : jn[AW-1:0];
            adc_valid <= 1'b1;
        end
    end
endmodule
