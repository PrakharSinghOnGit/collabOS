#include "../include/screen.h"
#include "../include/keyboard.h"
#include "../include/net.h"

void kernel_main(void) {
    // Initialize terminal
    terminal_initialize();
    
    // Clear screen and display welcome message
    clear_screen();
    print("Welcome to CollabOS v0.1\n");
    print("========================\n\n");
    print("Initializing kernel...\n");
    
    // Initialize subsystems
    keyboard_initialize();
    print("Keyboard initialized.\n");
    
    network_initialize();
    print("Network initialized.\n");
    
    print("\nCollabOS is ready!\n");
    print("Type something to test the system:\n");
    
    // Main kernel loop
    while (1) {
        // Handle keyboard input
        keyboard_handler();
        
        // Handle network packets
        network_handler();
        
        // Simple halt instruction to prevent 100% CPU usage
        asm volatile ("hlt");
    }
}