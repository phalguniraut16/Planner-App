# Synthesis -> implementation -> PDI + XSA.   vivado -mode batch -source versal/build.tcl -tclargs vck190
set board_key "vck190"
if {$argc > 0} { set board_key [lindex $argv 0] }
set root [file normalize [file join [file dirname [info script]] ..]]
set proj_name "spgd_versal_${board_key}"
open_project [file join $root build $proj_name ${proj_name}.xpr]

launch_runs synth_1 -jobs 8
wait_on_run synth_1
launch_runs impl_1 -to_step write_device_image -jobs 8
wait_on_run impl_1
open_run impl_1
report_timing_summary -file [file join $root build timing_summary.rpt]
report_utilization    -file [file join $root build utilization.rpt]
write_hw_platform -fixed -force -file [file join $root build spgd_versal_${board_key}.xsa]
puts "Done. PDI is in build/$proj_name/$proj_name.runs/impl_1/ ; XSA in build/"
