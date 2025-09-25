#include "../include/keyboard.h"
#include "../include/screen.h"

// Simple scan code to ASCII mapping for US keyboard layout
static char scan_code_to_ascii[256] = {
    0, 0, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b',
    '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\n',
    0, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '`',
    0, '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0,
    '*', 0, ' ', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '0', '.'
};

// Port I/O functions (simplified for cross-platform compilation)
uint8_t inb(uint16_t port) {
    // Placeholder implementation - will be replaced with proper assembly in final build
    (void)port;
    return 0;
}

void outb(uint16_t port, uint8_t data) {
    // Placeholder implementation - will be replaced with proper assembly in final build
    (void)port;
    (void)data;
}

void keyboard_initialize(void) {
    // Basic keyboard initialization
    // For now, we'll just rely on BIOS setup
    // In a more advanced OS, we'd set up interrupt handlers here
}

uint8_t keyboard_read_scan_code(void) {
    // Wait for keyboard data to be available
    while (!(inb(KEYBOARD_STATUS_PORT) & KEYBOARD_STATUS_OUTPUT_BUFFER)) {
        // Wait
    }
    
    // Read the scan code
    return inb(KEYBOARD_DATA_PORT);
}

char scan_code_to_char(uint8_t scan_code) {
    // Since scan_code is uint8_t, it's always < 256
    return scan_code_to_ascii[scan_code];
}

void keyboard_handler(void) {
    // Check if keyboard data is available
    if (inb(KEYBOARD_STATUS_PORT) & KEYBOARD_STATUS_OUTPUT_BUFFER) {
        uint8_t scan_code = inb(KEYBOARD_DATA_PORT);
        
        // Only handle key press events (scan code < 0x80)
        if (scan_code < 0x80) {
            char ascii_char = scan_code_to_char(scan_code);
            if (ascii_char != 0) {
                // Echo the character to screen
                terminal_putchar(ascii_char);
                
                // Special handling for newline
                if (ascii_char == '\n') {
                    print("CollabOS> ");
                }
            }
        }
    }
}