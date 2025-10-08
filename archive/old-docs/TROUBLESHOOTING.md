# CollabOS Boot Troubleshooting Guide

## Current Issue: GRUB Menu Shows But Kernel Won't Boot

### What We've Fixed:

1. ✅ **Multiboot Header** - Verified with `i686-elf-grub-file --is-x86-multiboot`
2. ✅ **Linker Script** - Proper section ordering (.multiboot first)
3. ✅ **Boot Assembly** - Added early boot diagnostics
4. ✅ **Serial Output** - Added debugging via COM1
5. ✅ **Cross-Compilation** - Using x86_64-elf-gcc with -m32 flag

### How to Test:

```bash
# Quick rebuild and run
make clean && make run
```

### What to Look For:

When the QEMU window opens and you select "CollabOS v0.1" from GRUB:

1. **If you see "XXYY" in top-left corner:**

   - ✅ Kernel is loading!
   - ✅ Stack is set up!
   - The kernel_main function is being called
   - Welcome message should appear

2. **If screen goes black with no "XXYY":**

   - ❌ GRUB cannot execute the kernel
   - Problem: Multiboot handoff failing
   - Solution: Check multiboot header alignment

3. **If you see "Welcome to CollabOS":**
   - 🎉 **SUCCESS!** Everything is working!

### Debug Commands:

```bash
# Verify multiboot header
i686-elf-grub-file --is-x86-multiboot build/kernel.bin

# Check kernel sections
x86_64-elf-objdump -h build/kernel.bin | grep -E "multiboot|text"

# View multiboot header contents
x86_64-elf-objdump -s -j .multiboot build/kernel.bin

# Run with serial logging
qemu-system-i386 -cdrom build/collabos.iso -m 512M -serial file:serial.log

# Then check serial.log for debug output
cat serial.log
```

### Common Issues & Solutions:

#### Issue 1: "booting failed could not read boot disk"

**Cause:** GRUB loaded but can't find/execute kernel
**Solution:**

- Multiboot header must be in first 8KB
- Kernel must be at /boot/kernel.bin in ISO
- Entry point must be named `_start`

**Fixed by:**

- Updated linker.ld to place .multiboot section first
- Verified with objdump that it's at 0x100000

#### Issue 2: Black screen after GRUB

**Cause:** Kernel crashes immediately
**Solution:**

- Added early boot diagnostics (XXYY output)
- Stack pointer must be set before C code
- Interrupts should be disabled initially

**Fixed by:**

- Proper stack setup in boot.s
- CLI instruction before halt
- Reset EFLAGS register

#### Issue 3: No output visible

**Cause:** VGA buffer not being written to
**Solution:**

- Direct memory write to 0xB8000 for VGA text mode
- Each character is 2 bytes: ASCII + attribute

**Fixed by:**

- Added direct VGA writes in boot.s
- terminal_initialize() clears and sets up screen
- Added serial output for debugging

### Technical Details:

**Memory Layout:**

```
0x00000000 - 0x000FFFFF : Low memory (BIOS, video RAM)
0x000B8000               : VGA text buffer (25 lines x 80 columns x 2 bytes)
0x00100000 (1MB)         : Kernel load address
0x00101000               : Code section (.text)
0x00102000+              : Data sections
Stack: 16KB in BSS section
```

**Multiboot Header Format:**

```
Offset  | Size | Value      | Description
--------|------|------------|-------------
0x0     | 4    | 0x1BADB002 | Magic number
0x4     | 4    | 0x00000003 | Flags (page align + memory info)
0x8     | 4    | checksum   | -(magic + flags)
```

**Boot Sequence:**

1. BIOS loads GRUB from ISO
2. GRUB reads grub.cfg
3. User selects "CollabOS v0.1"
4. GRUB finds /boot/kernel.bin
5. GRUB validates multiboot header
6. GRUB loads kernel to 0x100000
7. GRUB jumps to `_start`
8. `_start` sets up stack
9. `_start` calls `kernel_main()`
10. kernel_main initializes and loops

### Next Steps If Still Failing:

1. **Check QEMU window carefully** - Look for "XXYY" text
2. **Try VirtualBox instead:**

   ```bash
   VBoxManage createvm --name "CollabOS" --register
   VBoxManage modifyvm "CollabOS" --memory 512 --boot1 dvd
   VBoxManage storagectl "CollabOS" --name "IDE" --add ide
   VBoxManage storageattach "CollabOS" --storagectl "IDE" --port 0 --device 0 --type dvddrive --medium build/collabos.iso
   VBoxManage startvm "CollabOS"
   ```

3. **Enable verbose GRUB:**
   Edit `boot/grub.cfg`:

   ```
   set debug=all
   ```

4. **Try minimal kernel:**
   Comment out everything in kernel_main except terminal_initialize and one print statement

### Success Criteria:

- ✅ GRUB menu appears
- ✅ "XXYY" appears when kernel loads
- ✅ "Welcome to CollabOS v0.1" message displays
- ✅ Keyboard echoes characters
- ✅ Serial log shows initialization messages

---

**Current Status:** Kernel compiles, multiboot header is valid, waiting for boot test results.
