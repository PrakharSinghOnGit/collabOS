/* CollabOS Kernel Linker Script */

ENTRY(_start)

SECTIONS
{
    /* Kernel starts at 1MB (standard for multiboot) */
    . = 0x00100000;

    /* Multiboot header MUST be in first 8KB and at the start */
    .multiboot ALIGN(4K) : AT(ADDR(.multiboot))
    {
        *(.multiboot)
    }

    /* Text section (code) immediately after multiboot header */
    .text ALIGN(4K) : AT(ADDR(.text))
    {
        *(.text)
        *(.text.*)
    }

    /* Read-only data */
    .rodata ALIGN(4K) : AT(ADDR(.rodata))
    {
        *(.rodata)
        *(.rodata.*)
    }

    /* Initialized data */
    .data ALIGN(4K) : AT(ADDR(.data))
    {
        *(.data)
        *(.data.*)
    }

    /* Uninitialized data (BSS) */
    .bss ALIGN(4K) : AT(ADDR(.bss))
    {
        *(COMMON)
        *(.bss)
        *(.bss.*)
    }

    /* End of kernel */
    _kernel_end = .;
}