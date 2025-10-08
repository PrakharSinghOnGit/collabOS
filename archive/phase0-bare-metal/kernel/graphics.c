#include "../include/graphics.h"
#include "../include/keyboard.h"

static uint8_t* vga_memory = (uint8_t*)GFX_MEMORY;
static int current_mode = 0; // 0 = text, 1 = graphics

// Simple 8x8 font (subset of ASCII characters)
static const uint8_t font8x8[128][8] = {
    // Space (32)
    [32] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},
    // ! (33)
    [33] = {0x18, 0x3C, 0x3C, 0x18, 0x18, 0x00, 0x18, 0x00},
    // A-Z (65-90)
    [65] = {0x18, 0x3C, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00},
    [66] = {0x7C, 0x66, 0x66, 0x7C, 0x66, 0x66, 0x7C, 0x00},
    [67] = {0x3C, 0x66, 0x60, 0x60, 0x60, 0x66, 0x3C, 0x00},
    [68] = {0x78, 0x6C, 0x66, 0x66, 0x66, 0x6C, 0x78, 0x00},
    [69] = {0x7E, 0x60, 0x60, 0x78, 0x60, 0x60, 0x7E, 0x00},
    [70] = {0x7E, 0x60, 0x60, 0x78, 0x60, 0x60, 0x60, 0x00},
    [71] = {0x3C, 0x66, 0x60, 0x6E, 0x66, 0x66, 0x3C, 0x00},
    [72] = {0x66, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00},
    [73] = {0x3C, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00},
    [74] = {0x1E, 0x0C, 0x0C, 0x0C, 0x0C, 0x6C, 0x38, 0x00},
    [75] = {0x66, 0x6C, 0x78, 0x70, 0x78, 0x6C, 0x66, 0x00},
    [76] = {0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x7E, 0x00},
    [77] = {0x63, 0x77, 0x7F, 0x6B, 0x63, 0x63, 0x63, 0x00},
    [78] = {0x66, 0x76, 0x7E, 0x7E, 0x6E, 0x66, 0x66, 0x00},
    [79] = {0x3C, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00},
    [80] = {0x7C, 0x66, 0x66, 0x7C, 0x60, 0x60, 0x60, 0x00},
    // Add more letters as needed...
};

void switch_to_graphics_mode(void) {
    // Set VGA to mode 13h (320x200, 256 colors)
    outb(0x3C2, 0x63);  // Misc output register
    
    // Sequencer registers
    outb(0x3C4, 0x00); outb(0x3C5, 0x03);
    outb(0x3C4, 0x01); outb(0x3C5, 0x01);
    outb(0x3C4, 0x02); outb(0x3C5, 0x0F);
    outb(0x3C4, 0x03); outb(0x3C5, 0x00);
    outb(0x3C4, 0x04); outb(0x3C5, 0x0E);
    
    current_mode = 1;
}

void switch_to_text_mode(void) {
    // Switch back to text mode (mode 03h)
    outb(0x3C2, 0x67);
    current_mode = 0;
}

void graphics_init(void) {
    switch_to_graphics_mode();
    graphics_clear_screen(COLOR_BLACK);
}

void graphics_put_pixel(int x, int y, uint8_t color) {
    if (x >= 0 && x < GFX_WIDTH && y >= 0 && y < GFX_HEIGHT) {
        vga_memory[y * GFX_WIDTH + x] = color;
    }
}

void graphics_clear_screen(uint8_t color) {
    for (int i = 0; i < GFX_WIDTH * GFX_HEIGHT; i++) {
        vga_memory[i] = color;
    }
}

void graphics_draw_line(int x1, int y1, int x2, int y2, uint8_t color) {
    // Bresenham's line algorithm
    int dx = x2 - x1;
    int dy = y2 - y1;
    int dx_abs = dx < 0 ? -dx : dx;
    int dy_abs = dy < 0 ? -dy : dy;
    int sx = dx < 0 ? -1 : 1;
    int sy = dy < 0 ? -1 : 1;
    int x = x1;
    int y = y1;
    
    if (dx_abs > dy_abs) {
        int err = dx_abs / 2;
        while (x != x2) {
            graphics_put_pixel(x, y, color);
            err -= dy_abs;
            if (err < 0) {
                y += sy;
                err += dx_abs;
            }
            x += sx;
        }
    } else {
        int err = dy_abs / 2;
        while (y != y2) {
            graphics_put_pixel(x, y, color);
            err -= dx_abs;
            if (err < 0) {
                x += sx;
                err += dy_abs;
            }
            y += sy;
        }
    }
    graphics_put_pixel(x, y, color);
}

void graphics_draw_rect(int x, int y, int width, int height, uint8_t color) {
    // Draw four lines to form a rectangle
    graphics_draw_line(x, y, x + width, y, color);                    // Top
    graphics_draw_line(x + width, y, x + width, y + height, color);   // Right
    graphics_draw_line(x + width, y + height, x, y + height, color);  // Bottom
    graphics_draw_line(x, y + height, x, y, color);                   // Left
}

void graphics_fill_rect(int x, int y, int width, int height, uint8_t color) {
    for (int row = y; row < y + height && row < GFX_HEIGHT; row++) {
        for (int col = x; col < x + width && col < GFX_WIDTH; col++) {
            graphics_put_pixel(col, row, color);
        }
    }
}

void graphics_draw_char(int x, int y, char c, uint8_t color) {
    unsigned char uc = (unsigned char)c;
    if (uc >= 128) return;
    
    const uint8_t* glyph = font8x8[uc];
    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            if (glyph[row] & (1 << col)) {
                graphics_put_pixel(x + col, y + row, color);
            }
        }
    }
}

void graphics_draw_string(int x, int y, const char* str, uint8_t color) {
    int cursor_x = x;
    while (*str) {
        if (*str == '\n') {
            cursor_x = x;
            y += 8;
        } else {
            graphics_draw_char(cursor_x, y, *str, color);
            cursor_x += 8;
        }
        str++;
    }
}