; CollabOS Boot Assembly
; Multiboot header and kernel entry point

section .multiboot
align 4
    ; Multiboot header
    MULTIBOOT_MAGIC         equ 0x1BADB002
    MULTIBOOT_FLAGS         equ 0x0
    MULTIBOOT_CHECKSUM      equ -(MULTIBOOT_MAGIC + MULTIBOOT_FLAGS)

    dd MULTIBOOT_MAGIC
    dd MULTIBOOT_FLAGS
    dd MULTIBOOT_CHECKSUM

section .bss
align 16
stack_bottom:
    resb 16384  ; 16KB stack
stack_top:

section .text
global _start
_start:
    ; Set up stack
    mov esp, stack_top

    ; Call kernel main function
    extern kernel_main
    call kernel_main

    ; If kernel_main returns, halt the system
    cli         ; Disable interrupts
.hang:
    hlt         ; Halt processor
    jmp .hang   ; If somehow we continue, loop forever