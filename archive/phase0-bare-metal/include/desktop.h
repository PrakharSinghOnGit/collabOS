#ifndef DESKTOP_H
#define DESKTOP_H

#include <stdint.h>

// Window structure
typedef struct {
    int x, y;
    int width, height;
    char title[64];
    uint8_t border_color;
    uint8_t bg_color;
    uint8_t title_color;
    int active;
} Window;

// Desktop functions
void desktop_init(void);
void desktop_draw(void);
void desktop_create_window(Window* win, int x, int y, int width, int height, const char* title);
void desktop_draw_window(Window* win);
void desktop_run(void);

// Mouse cursor
void draw_cursor(int x, int y);

#endif