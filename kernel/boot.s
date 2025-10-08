; CollabOS Boot Assembly
; Multiboot header and kernel entry point

; Multiboot constants
MULTIBOOT_MAGIC         equ 0x1BADB002
MULTIBOOT_PAGE_ALIGN    equ 1<<0
MULTIBOOT_MEMORY_INFO   equ 1<<1
MULTIBOOT_FLAGS         equ MULTIBOOT_PAGE_ALIGN | MULTIBOOT_MEMORY_INFO
MULTIBOOT_CHECKSUM      equ -(MULTIBOOT_MAGIC + MULTIBOOT_FLAGS)

; Multiboot header - MUST be in first 8KB of kernel
section .multiboot
align 4
multiboot_header:
    dd MULTIBOOT_MAGIC
    dd MULTIBOOT_FLAGS
    dd MULTIBOOT_CHECKSUM

; Reserve stack space
section .bss
align 16
stack_bottom:
    resb 16384  ; 16KB stack
stack_top:

; Kernel entry point
section .text
global _start:function (_start.end - _start)
_start:
    ; Set up stack pointer
    mov esp, stack_top

    ; Reset EFLAGS
    push 0
    popf

    ; Call the kernel main function
    extern kernel_main
    call kernel_main

    ; If kernel_main returns, halt the system
    cli         ; Disable interrupts
.hang:
    hlt         ; Halt CPU
    jmp .hang   ; Loop forever
.end: