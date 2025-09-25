/* CollabOS Kernel Linker Script */

ENTRY(_start)

SECTIONS
{
    /* Kernel starts at 1MB */
    . = 0x100000;

    /* Multiboot header must be in first 8KB */
    .multiboot :
    {
        *(.multiboot)
    }

    /* Text section (code) */
    .text ALIGN(4K) :
    {
        *(.text)
    }

    /* Read-only data */
    .rodata ALIGN(4K) :
    {
        *(.rodata)
    }

    /* Initialized data */
    .data ALIGN(4K) :
    {
        *(.data)
    }

    /* Uninitialized data */
    .bss ALIGN(4K) :
    {
        *(COMMON)
        *(.bss)
    }
}