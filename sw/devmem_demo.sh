#!/bin/sh
# Linux quick test (root). Locks the on-chip emulator and prints metric.
B=0xA4000000
devmem $((B+0x00)) 32 0xD            # run | maximize | emulator
sleep 0.01
echo "STATUS=$(devmem $((B+0x04)) 32) (bit1=locked)  METRIC=$(devmem $((B+0x20)) 32)/65535  ITER=$(devmem $((B+0x24)) 32)"
devmem $((B+0x00)) 32 0xC            # stop
