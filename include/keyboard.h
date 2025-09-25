#ifndef KEYBOARD_H
#define KEYBOARD_H

#include <stdint.h>

// Keyboard ports
#define KEYBOARD_DATA_PORT 0x60
#define KEYBOARD_STATUS_PORT 0x64

// Keyboard status register bits
#define KEYBOARD_STATUS_OUTPUT_BUFFER 0x01
#define KEYBOARD_STATUS_INPUT_BUFFER 0x02

// Function declarations
void keyboard_initialize(void);
uint8_t keyboard_read_scan_code(void);
char scan_code_to_char(uint8_t scan_code);
void keyboard_handler(void);

// Utility functions for port I/O
uint8_t inb(uint16_t port);
void outb(uint16_t port, uint8_t data);

#endif