#include "../include/screen.h"
#include "../include/keyboard.h"
#include "../include/net.h"
#include "../include/serial.h"

void kernel_main(void) {
    // Ultra-simple VGA test
    volatile uint16_t* vga = (volatile uint16_t*)0xB8000;
    
    // Clear screen with green background
    for (int i = 0; i < 80 * 25; i++) {
        vga[i] = 0x2020;  // Space with green on black
    }
    
    // Write message
    const char* msg = "WELCOME TO COLLABOS v0.1 - SUCCESS!";
    int col = 0;
    while (msg[col] && col < 80) {
        vga[col] = 0x0F00 | msg[col];  // White text on black background
        col++;
    }
    
    // Write second line
    vga += 80;  // Next line
    const char* msg2 = "Kernel is running! Press Ctrl+C in terminal or close window to exit.";
    col = 0;
    while (msg2[col] && col < 80) {
        vga[col] = 0x0700 | msg2[col];  // Light gray text
        col++;
    }
    
    // Infinite loop with halt
    while (1) {
        __asm__ volatile ("hlt");
    }
}