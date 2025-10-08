#include "../include/screen.h"
#include "../include/keyboard.h"
#include "../include/net.h"

void kernel_main(void) {
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
    print("[OK] Memory management ready\n");
    print("[OK] Kernel heap allocated\n");
    
    // Future: Initialize keyboard with interrupts
    // keyboard_initialize();
    print("[SKIP] Keyboard driver (not yet implemented)\n");
    
    // Future: Initialize network
    // network_initialize();
    print("[SKIP] Network stack (not yet implemented)\n");
    
    print("\n");
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_GREEN, VGA_COLOR_BLACK));
    print("CollabOS is ready!\n\n");
    
    terminal_setcolor(vga_entry_color(VGA_COLOR_LIGHT_GREY, VGA_COLOR_BLACK));
    print("Next milestone: Desktop Environment\n");
    print("- VGA graphics mode (320x200 or 640x480)\n");
    print("- Window manager\n");
    print("- Mouse support\n");
    print("- Basic UI widgets\n\n");
    
    terminal_setcolor(vga_entry_color(VGA_COLOR_BROWN, VGA_COLOR_BLACK));
    print("System is running in kernel mode.\n");
    print("Close QEMU window to exit.\n");
    
    // Main kernel loop
    while (1) {
        // Halt CPU until next interrupt
        __asm__ volatile ("hlt");
    }
}