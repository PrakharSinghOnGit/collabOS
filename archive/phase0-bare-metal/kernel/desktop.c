#include "../include/desktop.h"
#include "../include/graphics.h"
#include "../include/screen.h"

#define MAX_WINDOWS 10
static Window windows[MAX_WINDOWS];
static int window_count = 0;

// Helper function to copy strings
static void str_copy(char* dest, const char* src, int max_len) {
    int i = 0;
    while (src[i] && i < max_len - 1) {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';
}

void desktop_init(void) {
    // Initialize graphics mode
    graphics_init();
    
    // Draw desktop background
    graphics_clear_screen(COLOR_DARK_GRAY);
    
    // Draw taskbar at bottom
    graphics_fill_rect(0, GFX_HEIGHT - 20, GFX_WIDTH, 20, COLOR_LIGHT_GRAY);
    
    // Draw title
    graphics_draw_string(10, 5, "CollabOS Desktop Environment - Alpha v0.1", COLOR_WHITE);
    
    window_count = 0;
}

void desktop_create_window(Window* win, int x, int y, int width, int height, const char* title) {
    if (window_count >= MAX_WINDOWS) return;
    
    win->x = x;
    win->y = y;
    win->width = width;
    win->height = height;
    str_copy(win->title, title, 64);
    win->border_color = COLOR_BLUE;
    win->bg_color = COLOR_WHITE;
    win->title_color = COLOR_BLUE;
    win->active = 1;
    
    windows[window_count++] = *win;
}

void desktop_draw_window(Window* win) {
    if (!win->active) return;
    
    // Draw title bar
    graphics_fill_rect(win->x, win->y, win->width, 16, win->title_color);
    
    // Draw window border
    graphics_draw_rect(win->x, win->y, win->width, win->height, win->border_color);
    
    // Draw window background
    graphics_fill_rect(win->x + 1, win->y + 17, win->width - 2, win->height - 18, win->bg_color);
    
    // Draw title text
    graphics_draw_string(win->x + 5, win->y + 4, win->title, COLOR_WHITE);
    
    // Draw close button (X)
    graphics_fill_rect(win->x + win->width - 14, win->y + 2, 12, 12, COLOR_RED);
    graphics_draw_string(win->x + win->width - 12, win->y + 4, "X", COLOR_WHITE);
}

void desktop_draw(void) {
    // Redraw desktop background
    graphics_fill_rect(0, 20, GFX_WIDTH, GFX_HEIGHT - 40, COLOR_DARK_GRAY);
    
    // Draw all windows
    for (int i = 0; i < window_count; i++) {
        desktop_draw_window(&windows[i]);
    }
    
    // Redraw taskbar
    graphics_fill_rect(0, GFX_HEIGHT - 20, GFX_WIDTH, 20, COLOR_LIGHT_GRAY);
    graphics_draw_string(5, GFX_HEIGHT - 15, "CollabOS | Windows: ", COLOR_BLACK);
    
    // Draw window count
    char count_str[4];
    count_str[0] = '0' + (window_count % 10);
    count_str[1] = '\0';
    graphics_draw_string(140, GFX_HEIGHT - 15, count_str, COLOR_BLACK);
}

void draw_cursor(int x, int y) {
    // Simple arrow cursor
    graphics_draw_line(x, y, x, y + 10, COLOR_WHITE);
    graphics_draw_line(x, y, x + 7, y + 7, COLOR_WHITE);
    graphics_draw_line(x, y + 10, x + 4, y + 7, COLOR_WHITE);
    graphics_draw_line(x + 4, y + 7, x + 7, y + 7, COLOR_WHITE);
}

void desktop_run(void) {
    // Create demo windows
    Window win1, win2, win3;
    
    desktop_create_window(&win1, 20, 30, 120, 80, "Welcome");
    desktop_create_window(&win2, 150, 50, 140, 100, "Terminal");
    desktop_create_window(&win3, 50, 120, 100, 70, "Files");
    
    // Draw the desktop
    desktop_draw();
    
    // Add content to windows
    graphics_draw_string(win1.x + 10, win1.y + 25, "CollabOS", COLOR_BLACK);
    graphics_draw_string(win1.x + 10, win1.y + 35, "Alpha 0.1", COLOR_BLACK);
    graphics_draw_string(win1.x + 10, win1.y + 50, "Desktop", COLOR_BLACK);
    graphics_draw_string(win1.x + 10, win1.y + 60, "Ready!", COLOR_LIGHT_GREEN);
    
    graphics_draw_string(win2.x + 10, win2.y + 25, "> ls", COLOR_BLACK);
    graphics_draw_string(win2.x + 10, win2.y + 35, "docs/", COLOR_BLUE);
    graphics_draw_string(win2.x + 10, win2.y + 45, "bin/", COLOR_BLUE);
    graphics_draw_string(win2.x + 10, win2.y + 55, "kernel.bin", COLOR_BLACK);
    graphics_draw_string(win2.x + 10, win2.y + 75, "> _", COLOR_BLACK);
    
    graphics_draw_string(win3.x + 10, win3.y + 25, "Documents", COLOR_BLACK);
    graphics_draw_string(win3.x + 10, win3.y + 35, "Pictures", COLOR_BLACK);
    graphics_draw_string(win3.x + 10, win3.y + 45, "Music", COLOR_BLACK);
    
    // Draw cursor
    draw_cursor(160, 90);
    
    // Main loop (for now just halt)
    while (1) {
        __asm__ volatile ("hlt");
    }
}