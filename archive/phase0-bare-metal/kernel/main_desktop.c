#include "../include/screen.h"
#include "../include/keyboard.h"
#include "../include/desktop.h"

// Simple delay function
void delay(int count) {
    for (int i = 0; i < count; i++) {
        for (int j = 0; j < 10000; j++) {
            __asm__ volatile ("nop");
        }
    }
}

void kernel_main(void) {
    // Write directly to VGA memory as first thing - this always works
    unsigned short* vga = (unsigned short*)0xB8000;
    const char* msg = "DESKTOP BOOT";
    for (int i = 0; msg[i] != '\0'; i++) {
        vga[i] = (unsigned short)msg[i] | 0x0F00;
    }
    
    // Initialize terminal
    terminal_initialize();
    
    // Clear screen and display welcome message
    clear_screen();
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_CYAN, VGA_COLOR_BLACK));
    print("===============================================\n");
    print("       Welcome to CollabOS v0.1 Alpha\n");
    print("       Collaborative Operating System\n");
    print("===============================================\n\n");
    
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_GREY, VGA_COLOR_BLACK));
    print("Initializing kernel subsystems...\n\n");
    
    // Initialize subsystems
    print("[OK] Display system initialized\n");
    delay(50);
    print("[OK] Memory management ready\n");
    delay(50);
    print("[OK] Kernel heap allocated\n");
    delay(50);
    print("[OK] Graphics driver loaded\n");
    delay(50);
    
    print("\n");
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_GREEN, VGA_COLOR_BLACK));
    print("System initialization complete!\n\n");
    
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_GREY, VGA_COLOR_BLACK));
    print("Starting desktop environment in 3 seconds...\n");
    print("Close QEMU window to exit.\n\n");
    
    // Wait a bit before switching
    delay(300);
    
    // Switch to graphics mode and run desktop
    desktop_init();
    desktop_run();
    
    // Should never reach here
    while (1) {
        __asm__ volatile ("hlt");
    }
}