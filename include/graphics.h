#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <stdint.h>

// VGA Graphics Mode Constants
#define GFX_WIDTH 320
#define GFX_HEIGHT 200
#define GFX_MEMORY 0xA0000

// Color palette (VGA 256 colors)
#define COLOR_BLACK 0x00
#define COLOR_BLUE 0x01
#define COLOR_GREEN 0x02
#define COLOR_CYAN 0x03
#define COLOR_RED 0x04
#define COLOR_MAGENTA 0x05
#define COLOR_BROWN 0x06
#define COLOR_LIGHT_GRAY 0x07
#define COLOR_DARK_GRAY 0x08
#define COLOR_LIGHT_BLUE 0x09
#define COLOR_LIGHT_GREEN 0x0A
#define COLOR_LIGHT_CYAN 0x0B
#define COLOR_LIGHT_RED 0x0C
#define COLOR_LIGHT_MAGENTA 0x0D
#define COLOR_YELLOW 0x0E
#define COLOR_WHITE 0x0F

// Graphics functions
void graphics_init(void);
void graphics_put_pixel(int x, int y, uint8_t color);
void graphics_draw_line(int x1, int y1, int x2, int y2, uint8_t color);
void graphics_draw_rect(int x, int y, int width, int height, uint8_t color);
void graphics_fill_rect(int x, int y, int width, int height, uint8_t color);
void graphics_clear_screen(uint8_t color);
void graphics_draw_char(int x, int y, char c, uint8_t color);
void graphics_draw_string(int x, int y, const char* str, uint8_t color);

// Switch between text and graphics mode
void switch_to_graphics_mode(void);
void switch_to_text_mode(void);

#endif