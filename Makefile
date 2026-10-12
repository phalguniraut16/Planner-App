sim:
	iverilog -g2012 -o spgd_tb.out rtl/*.v tb/spgd_tb.v
	vvp spgd_tb.out
wave:
	gtkwave spgd_tb.vcd
clean:
	-rm -f *.out *.vcd
