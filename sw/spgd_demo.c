/* Bare-metal (Vitis) SPGD demo. Locks the on-chip plant emulator, injects drift, relocks. */
#include <stdio.h>
#include <stdint.h>
#include "xil_io.h"
#include "sleep.h"

#define BASE 0xA4000000u
enum { CTRL=0x00, STAT=0x04, DELTA=0x08, GAIN=0x0C, STEPMAX=0x10, SETTLE=0x14,
       LOCKTHR=0x18, SEED=0x1C, METRIC=0x20, ITER=0x24, DRIFT=0x28, PHASE0=0x40 };
#define CTRL_RUN 1u
#define CTRL_MAX 4u
#define CTRL_EMU 8u
static uint32_t rd(uint32_t o){ return Xil_In32(BASE+o); }
static void wr(uint32_t o,uint32_t v){ Xil_Out32(BASE+o,v); }

static void wait_lock(const char *tag){
    while (!(rd(STAT) & 2)) usleep(100);
    printf("%s: locked, metric=%u (%.1f%%), iter=%u\r\n", tag, rd(METRIC), rd(METRIC)*100.0/65535, rd(ITER));
}
int main(void){
    wr(DELTA,0x0200); wr(GAIN,6); wr(STEPMAX,0x0400); wr(SETTLE,8); wr(LOCKTHR,0xF333);
    wr(CTRL, CTRL_RUN|CTRL_MAX|CTRL_EMU);
    wait_lock("initial lock");
    wr(DRIFT, 1500);                        /* disturbance across channels */
    usleep(50);
    printf("after drift: metric=%u\r\n", rd(METRIC));
    usleep(2000);
    wait_lock("relock");
    wr(CTRL, CTRL_MAX|CTRL_EMU);            /* stop; phases held */
    for (int i=0;i<8;i++) printf("phase[%d]=0x%04x\r\n", i, rd(PHASE0+4*i)&0xFFFF);
    return 0;
}
