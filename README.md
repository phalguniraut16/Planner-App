# SPGD Coherent-Beam-Combining Controller – Versal (VCK190 / VMK180)

Stochastic Parallel Gradient Descent phase-locking of N fibre/laser channels. All channels are perturbed at once with random ±δ, the combined-beam metric J (power-in-the-bucket from a photodetector ADC) is measured twice, and every channel is updated from the single difference:

`u_j ← u_j + G·(J(u+δs) − J(u−δs))·s_j`, `s_j ∈ {±1}` (xorshift32 PRNG), phase words wrap at 65536 = 2π.

```
photodiode→ADC ─► spgd_core ─► DAC / phase modulators (N×16-bit)       ◄─ external (FMC) ports
                      ▲    ▲
        plant_emu ────┘    └── AXI4-Lite regs ◄── Arm cores (M_AXI_FPD)
   (on-chip N-beam emulator, plant_en=1)
```
Per iteration: 1 RNG + (apply + settle + average)×2 + 1 update ≈ 54 cycles at defaults (settle 8, 16-sample average) → ~1.8 M iterations/s at 100 MHz with the emulator. With real optics, iteration rate is set by `SETTLE` and modulator/detector bandwidth.

## Files
`rtl/spgd_core.v` controller · `rtl/plant_emu.v` + `rtl/sin_rom.v` synthesizable CBC emulator · `rtl/spgd_axi.v` registers/wrapper · `tb/spgd_tb.v` self-checking test · `versal/*.tcl` project/build · `sw/` bare-metal + Linux demos.

## Parameters (compile time, `spgd_axi`)
`N` beams (2–16; power of two keeps emulator full-scale exact) · `AVG_LOG2` samples averaged (4 → 16) · `REF_CH0` channel 0 is the unperturbed reference (1).

## Registers (base 0xA4000000)
| Off | Name | Notes |
|---|---|---|
| 0x00 | CTRL | [0] run, [1] soft_reset, [2] maximize (0 = minimise metric), [3] plant_en (1 = emulator, 0 = external ADC) |
| 0x04 | STATUS | [0] busy, [1] locked (metric ≥ LOCK_THR; ≤ when minimising) |
| 0x08 | DELTA | perturbation amplitude, phase LSBs (default 0x0200 ≈ 0.049 rad) |
| 0x0C | GAIN | right-shift on ΔJ (default 6; larger = smaller steps / slower, quieter) |
| 0x10 | STEP_MAX | per-iteration step clamp (default 0x0400) |
| 0x14 | SETTLE | cycles to wait after each DAC update (default 8) |
| 0x18 | LOCK_THR | default 0xF333 (≈95 % of full scale) |
| 0x1C | SEED | PRNG seed (0 is mapped to 1) |
| 0x20 | METRIC | last averaged J (RO) |
| 0x24 | ITER | iteration count (RO) |
| 0x28 | DRIFT | emulator disturbance, phase LSBs × channel index |
| 0x40+4i | PHASE[i] | write sets phase while run=0; read = current estimate |

## Build / run
```
make sim                                                        # needs iverilog
vivado -mode batch -source versal/create_project.tcl -tclargs vck190
vivado -mode batch -source versal/build.tcl          -tclargs vck190
```
Then `sw/spgd_demo.c` (Vitis) or `sw/devmem_demo.sh` (Linux).

## Verification done (simulation only)
* Lock from the emulator's unknown phases, a drift step (metric dips to ~79 %), then relock to ≥98 %, then clean stop. 9/9 runs pass for N = 4, 8, 16 × 3 PRNG seeds (reported iteration counts are upper bounds, polled every 2000 cycles).
* Emulator ADC noise is on (±4 LSB-ish) so the loop is tested with a noisy metric.
* Verilator lint clean; Yosys finds no latches.



## Known limits
* Not run in Vivado or on hardware; Tcl property names may need adjusting per Vivado version. Timing not measured.
* Phase-only control; no phase-unwrapping or piston-range management beyond natural 2π wrap.
* Fixed ±δ Bernoulli perturbations, fixed gain (no adaptive/annealed gain), single metric channel.
* Emulator is a static-phase model with a linear drift knob, not a physical noise/dynamics model.
