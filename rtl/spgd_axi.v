`timescale 1ns / 1ps
// AXI4-Lite register wrapper: spgd_core + plant_emu (+ external ADC/DAC ports for real optics).
// Register map (byte offsets, 32-bit):
//  0x00 CTRL      R/W [0]run [1]soft_reset [2]maximize [3]plant_en (1=on-chip emulator, 0=external ADC)
//  0x04 STATUS    RO  [0]busy [1]locked
//  0x08 DELTA     R/W perturbation amplitude (phase LSBs, 65536=2pi)
//  0x0C GAIN      R/W [4:0] right-shift applied to dJ
//  0x10 STEP_MAX  R/W per-iteration step clamp (phase LSBs)
//  0x14 SETTLE    R/W settle cycles after each DAC update
//  0x18 LOCK_THR  R/W lock threshold on metric
//  0x1C SEED      R/W PRNG seed
//  0x20 METRIC    RO  last averaged metric
//  0x24 ITER      RO  iteration counter
//  0x28 DIST      R/W emulator drift (phase LSBs per channel index)
//  0x40+4*i PHASE[i] R/W (write only honoured while run=0); read = current phase estimate
module spgd_axi #(
    parameter N = 8, parameter AVG_LOG2 = 4, parameter REF_CH0 = 1
)(
    input  wire        s_axi_aclk,
    input  wire        s_axi_aresetn,
    input  wire [6:0]  s_axi_awaddr, input  wire s_axi_awvalid, output reg  s_axi_awready,
    input  wire [31:0] s_axi_wdata,  input  wire [3:0] s_axi_wstrb,
    input  wire        s_axi_wvalid, output reg  s_axi_wready,
    output reg  [1:0]  s_axi_bresp,  output reg  s_axi_bvalid, input wire s_axi_bready,
    input  wire [6:0]  s_axi_araddr, input  wire s_axi_arvalid, output reg  s_axi_arready,
    output reg  [31:0] s_axi_rdata,  output reg  [1:0] s_axi_rresp,
    output reg         s_axi_rvalid, input  wire s_axi_rready,
    // external optics (used when plant_en=0): connect FMC ADC / DAC here
    input  wire [15:0]     ext_adc_data,
    input  wire            ext_adc_valid,
    output wire [N*16-1:0] dac_data,
    output wire            dac_update
);
    // ---------------- registers ----------------
    reg run, soft_reset, maximize, plant_en;
    reg [15:0] delta, step_max, settle, lock_thr, drift;
    reg [4:0]  gain;
    reg [31:0] seed;
    reg        ph_wr; reg [3:0] ph_idx; reg [15:0] ph_dat;

    // reset: async assert, synchronous release
    reg [1:0] rs;
    wire rq_n = s_axi_aresetn & ~soft_reset;
    always @(posedge s_axi_aclk or negedge rq_n)
        if (!rq_n) rs <= 2'b00; else rs <= {rs[0],1'b1};
    wire rst_n = rs[1];

    wire [15:0] emu_data; wire emu_valid;
    wire [15:0] adc_d = plant_en ? emu_data  : ext_adc_data;
    wire        adc_v = plant_en ? emu_valid : ext_adc_valid;
    wire [15:0] metric; wire locked, busy; wire [31:0] iter; wire [N*16-1:0] phase_flat;

    spgd_core #(.N(N), .AVG_LOG2(AVG_LOG2), .REF_CH0(REF_CH0)) core (
        .clk(s_axi_aclk), .rst_n(rst_n), .run(run), .maximize(maximize),
        .delta(delta), .gain_shift(gain), .step_max(step_max), .settle_cycles(settle),
        .lock_thr(lock_thr), .seed(seed),
        .phase_wr_en(ph_wr), .phase_wr_idx(ph_idx), .phase_wr_data(ph_dat),
        .dac_data(dac_data), .dac_update(dac_update), .phase_flat(phase_flat),
        .adc_data(adc_d), .adc_valid(adc_v),
        .metric(metric), .locked(locked), .iter(iter), .busy(busy));

    plant_emu #(.N(N)) emu (.clk(s_axi_aclk), .rst_n(rst_n), .dac_data(dac_data),
                            .drift(drift), .adc_data(emu_data), .adc_valid(emu_valid));

    // ---------------- AXI write ----------------
    reg [6:0] awaddr_q; reg aw_got, w_got; reg [31:0] wdata_q; reg [3:0] wstrb_q;
    always @(posedge s_axi_aclk) begin
        if (!s_axi_aresetn) begin
            s_axi_awready<=0; s_axi_wready<=0; s_axi_bvalid<=0; s_axi_bresp<=0; aw_got<=0; w_got<=0;
            run<=0; soft_reset<=0; maximize<=1; plant_en<=1;
            delta<=16'h0200; gain<=5'd6; step_max<=16'h0400; settle<=16'd8;
            lock_thr<=16'hF333; seed<=32'h1234_5679; drift<=16'd0; ph_wr<=0; ph_idx<=0; ph_dat<=0;
        end else begin
            s_axi_awready<=0; s_axi_wready<=0; ph_wr<=0;
            if (!aw_got && !s_axi_bvalid && s_axi_awvalid && !s_axi_awready) begin
                s_axi_awready<=1; awaddr_q<=s_axi_awaddr; aw_got<=1; end
            if (!w_got && !s_axi_bvalid && s_axi_wvalid && !s_axi_wready) begin
                s_axi_wready<=1; wdata_q<=s_axi_wdata; wstrb_q<=s_axi_wstrb; w_got<=1; end
            if (aw_got && w_got && !s_axi_bvalid) begin
                if (awaddr_q[6]) begin                         // PHASE[i]
                    ph_wr<=1; ph_idx<=awaddr_q[5:2]; ph_dat<=wdata_q[15:0];
                end else case (awaddr_q[5:2])
                    4'd0: begin run<=wdata_q[0]; soft_reset<=wdata_q[1]; maximize<=wdata_q[2]; plant_en<=wdata_q[3]; end
                    4'd2: delta   <= wdata_q[15:0];
                    4'd3: gain    <= wdata_q[4:0];
                    4'd4: step_max<= wdata_q[15:0];
                    4'd5: settle  <= wdata_q[15:0];
                    4'd6: lock_thr<= wdata_q[15:0];
                    4'd7: seed    <= wdata_q;
                    4'd10: drift   <= wdata_q[15:0];
                    default: ;
                endcase
                s_axi_bvalid<=1; s_axi_bresp<=0; aw_got<=0; w_got<=0;
            end
            if (s_axi_bvalid && s_axi_bready) s_axi_bvalid<=0;
        end
    end

    // ---------------- AXI read ----------------
    always @(posedge s_axi_aclk) begin
        if (!s_axi_aresetn) begin s_axi_arready<=0; s_axi_rvalid<=0; s_axi_rdata<=0; s_axi_rresp<=0; end
        else begin
            s_axi_arready<=0;
            if (!s_axi_rvalid && s_axi_arvalid && !s_axi_arready) begin
                s_axi_arready<=1; s_axi_rvalid<=1; s_axi_rresp<=0;
                if (s_axi_araddr[6]) s_axi_rdata <= {16'd0, phase_flat[s_axi_araddr[5:2]*16 +: 16]};
                else case (s_axi_araddr[5:2])
                    4'd0: s_axi_rdata <= {28'd0, plant_en, maximize, soft_reset, run};
                    4'd1: s_axi_rdata <= {30'd0, locked, busy};
                    4'd2: s_axi_rdata <= {16'd0, delta};
                    4'd3: s_axi_rdata <= {27'd0, gain};
                    4'd4: s_axi_rdata <= {16'd0, step_max};
                    4'd5: s_axi_rdata <= {16'd0, settle};
                    4'd6: s_axi_rdata <= {16'd0, lock_thr};
                    4'd7: s_axi_rdata <= seed;
                    4'd8: s_axi_rdata <= {16'd0, metric};
                    4'd9: s_axi_rdata <= iter;
                    4'd10: s_axi_rdata <= {16'd0, drift};
                    default: s_axi_rdata <= 0;
                endcase
            end else if (s_axi_rvalid && s_axi_rready) s_axi_rvalid<=0;
        end
    end
endmodule
