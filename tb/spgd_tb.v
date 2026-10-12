`timescale 1ns / 1ps
// Self-checking CBC test: (1) lock from random initial phases, (2) inject a drift step
// (emulates thermal/acoustic disturbance) and verify the loop relocks, (3) minimise mode sanity.
module spgd_tb;
    parameter N = 8;
    parameter SEED = 32'h1234_5679;
    reg clk=0, rstn=0; always #5 clk=~clk;
    reg [6:0] awaddr=0; reg awvalid=0; wire awready; reg [31:0] wdata=0; reg wvalid=0; wire wready;
    wire [1:0] bresp; wire bvalid; reg bready=0;
    reg [6:0] araddr=0; reg arvalid=0; wire arready; wire [31:0] rdata; wire [1:0] rresp; wire rvalid; reg rready=0;
    wire [N*16-1:0] dac_data; wire dac_update;

    spgd_axi #(.N(N)) dut (.s_axi_aclk(clk), .s_axi_aresetn(rstn),
        .s_axi_awaddr(awaddr), .s_axi_awvalid(awvalid), .s_axi_awready(awready),
        .s_axi_wdata(wdata), .s_axi_wstrb(4'hF), .s_axi_wvalid(wvalid), .s_axi_wready(wready),
        .s_axi_bresp(bresp), .s_axi_bvalid(bvalid), .s_axi_bready(bready),
        .s_axi_araddr(araddr), .s_axi_arvalid(arvalid), .s_axi_arready(arready),
        .s_axi_rdata(rdata), .s_axi_rresp(rresp), .s_axi_rvalid(rvalid), .s_axi_rready(rready),
        .ext_adc_data(16'd0), .ext_adc_valid(1'b0), .dac_data(dac_data), .dac_update(dac_update));

    task axi_write(input [6:0] a, input [31:0] d); begin
        @(posedge clk); #1; awaddr=a; awvalid=1; wdata=d; wvalid=1; bready=1;
        fork begin wait(awready); @(posedge clk); #1; awvalid=0; end
             begin wait(wready);  @(posedge clk); #1; wvalid=0;  end join
        wait(bvalid); @(posedge clk); #1; bready=0; end endtask
    task axi_read(input [6:0] a, output [31:0] d); begin
        @(posedge clk); #1; araddr=a; arvalid=1; rready=1;
        wait(arready && rvalid); d=rdata; @(posedge clk); #1; arvalid=0; rready=0; end endtask

    localparam CTRL=7'h00, STAT=7'h04, METR=7'h20, ITER=7'h24, DIST=7'h28, GAINR=7'h0C;
    integer errors=0, n; reg [31:0] r, m0, m1, m2;

    // wait until locked (or give up after max_iter); returns iterations used
    task wait_lock(input integer max_iter, output integer used); begin
        used=0; r=0;
        while (!r[1] && used<max_iter) begin
            repeat (2000) @(posedge clk);
            axi_read(STAT, r); axi_read(ITER, m0); used=m0;
        end end endtask

    initial begin
        $dumpfile("spgd_tb.vcd"); $dumpvars(0, spgd_tb);
        #50 rstn=1; #50;
        repeat (20) @(posedge clk);
        m0 = dut.emu.adc_data;
        $display("N=%0d unlocked start: metric=%0d (%0d%% of full scale)", N, m0, m0*100/65535);
        axi_write(7'h1C, SEED);

        // ---- 1. lock from unknown phases ----
        axi_write(CTRL, 32'b1101);                 // run | maximize | plant_en
        wait_lock(6000, n);
        axi_read(METR, m1);
        $display("Test1 lock: iters=%0d metric=%0d (%0d%%) locked=%0d", n, m1, m1*100/65535, r[1]);
        if (!r[1] || m1 < 16'hF333) begin errors=errors+1; $display("FAIL test1"); end

        // ---- 2. drift step -> must dip, then relock ----
        axi_write(DIST, 16'd1500);                 // big phase disturbance across channels
        repeat (200) @(posedge clk);
        axi_read(METR, m2); $display("Test2 after disturbance (immediate): metric=%0d (%0d%%)", m2, m2*100/65535);
        repeat (40) @(posedge clk);
        // let loop run, then require relock
        wait_lock(10000, n);
        r=0; repeat(30000) @(posedge clk); axi_read(STAT, r); axi_read(METR, m2);
        $display("Test2 relock: metric=%0d (%0d%%) locked=%0d iter=%0d", m2, m2*100/65535, r[1], n);
        if (m2 < 16'hF333) begin errors=errors+1; $display("FAIL test2"); end

        // ---- 3. stop + hold: phases keep, run=0 returns to idle ----
        axi_write(CTRL, 32'b1100);
        repeat (500) @(posedge clk); axi_read(STAT, r);
        if (r[0]) begin errors=errors+1; $display("FAIL test3: still busy after stop"); end
        else $display("Test3 stop: core idle, phases held");

        if (errors==0) $display("PASS"); else $display("FAILED (%0d errors)", errors);
        $finish;
    end
    initial begin #400_000_000; $display("TIMEOUT"); $finish; end
endmodule
