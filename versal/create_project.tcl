# Vivado project generator: SPGD coherent-beam-combining controller on a Versal board.
#   vivado -mode batch -source versal/create_project.tcl [-tclargs vck190|vmk180]
# CIPS (M_AXI_FPD, 100 MHz PL clk) -> SmartConnect -> spgd_axi (core + on-chip plant emulator)
# External ADC/DAC ports are tied off for bring-up (plant_en=1 uses the emulator).
# NOTE: authored against the standard Versal IP-integrator flow; not run in Vivado where written.
set board_key "vck190"
if {$argc > 0} { set board_key [lindex $argv 0] }
switch -- $board_key {
    vck190  { set part "xcvc1902-vsva2197-2MP-e-S" }
    vmk180  { set part "xcvc1902-vsva2197-2MP-e-S" }
    default { error "Unknown board '$board_key'. Add its part number here." }
}
set root [file normalize [file join [file dirname [info script]] ..]]
set proj_name "spgd_versal_${board_key}"
create_project $proj_name [file join $root build $proj_name] -part $part -force
set bp [get_board_parts -quiet -latest_file_version "*${board_key}*"]
if {$bp ne ""} { set_property board_part [lindex $bp 0] [current_project] } \
else { puts "WARNING: board files for $board_key not installed; continuing with part only." }

add_files -norecurse [glob $root/rtl/*.v]
set_property file_type Verilog [get_files *.v]
update_compile_order -fileset sources_1

create_bd_design "spgd_bd"
set cips [create_bd_cell -type ip -vlnv xilinx.com:ip:versal_cips versal_cips_0]
if {$bp ne ""} {
    apply_bd_automation -rule xilinx.com:bd_rule:cips -config { \
        board_preset {Yes} boot_config {Custom} configure_noc {None} debug_config {JTAG} \
        design_flow {Full System} mc_type {None} num_mc_ddr {None} num_mc_lpddr {None} \
        pl_clocks {None} pl_resets {None}} $cips
}
set_property -dict [list CONFIG.PS_PMC_CONFIG { \
    PS_USE_M_AXI_FPD 1 PS_USE_PMCPL_CLK0 1 PMC_CRP_PL0_REF_CTRL_FREQMHZ 100 PS_NUM_FABRIC_RESETS 1 }] $cips

set smc [create_bd_cell -type ip -vlnv xilinx.com:ip:smartconnect smartconnect_0]
set_property -dict [list CONFIG.NUM_SI 1 CONFIG.NUM_MI 1] $smc
set sp  [create_bd_cell -type module -reference spgd_axi spgd_axi_0]

# tie off external ADC inputs (real optics are wired here later: FMC ADC/DAC)
set z16 [create_bd_cell -type ip -vlnv xilinx.com:ip:xlconstant zero16]
set_property -dict [list CONFIG.CONST_VAL 0 CONFIG.CONST_WIDTH 16] $z16
set z1  [create_bd_cell -type ip -vlnv xilinx.com:ip:xlconstant zero1]
set_property -dict [list CONFIG.CONST_VAL 0 CONFIG.CONST_WIDTH 1] $z1
connect_bd_net [get_bd_pins zero16/dout] [get_bd_pins spgd_axi_0/ext_adc_data]
connect_bd_net [get_bd_pins zero1/dout]  [get_bd_pins spgd_axi_0/ext_adc_valid]

connect_bd_net [get_bd_pins versal_cips_0/pl0_ref_clk] [get_bd_pins versal_cips_0/m_axi_fpd_aclk] \
               [get_bd_pins smartconnect_0/aclk] [get_bd_pins spgd_axi_0/s_axi_aclk]
connect_bd_net [get_bd_pins versal_cips_0/pl0_resetn] [get_bd_pins spgd_axi_0/s_axi_aresetn]
connect_bd_intf_net [get_bd_intf_pins versal_cips_0/M_AXI_FPD] [get_bd_intf_pins smartconnect_0/S00_AXI]
connect_bd_intf_net [get_bd_intf_pins smartconnect_0/M00_AXI]  [get_bd_intf_pins spgd_axi_0/s_axi]
assign_bd_address -offset 0xA4000000 -range 4K [get_bd_addr_segs spgd_axi_0/s_axi/reg0]
validate_bd_design
save_bd_design
make_wrapper -files [get_files spgd_bd.bd] -top
add_files -norecurse [file join [get_property directory [current_project]] ${proj_name}.gen/sources_1/bd/spgd_bd/hdl/spgd_bd_wrapper.v]
set_property top spgd_bd_wrapper [current_fileset]
update_compile_order -fileset sources_1
puts "Project created. Next: vivado -mode batch -source versal/build.tcl -tclargs $board_key"
