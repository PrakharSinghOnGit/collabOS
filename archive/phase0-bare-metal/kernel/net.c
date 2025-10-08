#include "../include/net.h"
#include "../include/screen.h"

// Global variables for network state
static uint32_t local_id = 1;  // Will be configurable later
static struct network_packet receive_buffer;

void network_initialize(void) {
    // Initialize network subsystem
    // For now, this is a placeholder
    // In a real implementation, we'd initialize network hardware
    
    // Set local machine ID (could be from BIOS or configuration)
    local_id = 1;  // VM 1
    
    // Clear receive buffer
    receive_buffer.source_id = 0;
    receive_buffer.dest_id = 0;
    receive_buffer.data_length = 0;
    
    for (int i = 0; i < MAX_PACKET_SIZE; i++) {
        receive_buffer.data[i] = 0;
    }
}

int network_send_packet(struct network_packet* packet) {
    // Placeholder for sending packets
    // In a real implementation, this would:
    // 1. Serialize the packet
    // 2. Send it over the network interface
    // 3. Return success/failure status
    
    if (packet == 0 || packet->data_length > MAX_PACKET_SIZE) {
        return -1;  // Error
    }
    
    // For now, just print that we're sending
    print("[NET] Sending packet to VM ");
    // Would print destination ID here
    print("\n");
    
    return 0;  // Success
}

int network_receive_packet(struct network_packet* packet) {
    // Placeholder for receiving packets
    // In a real implementation, this would:
    // 1. Check if data is available
    // 2. Read and deserialize packet
    // 3. Return packet data
    
    if (packet == 0) {
        return -1;  // Error
    }
    
    // For now, simulate no packets available
    return -1;  // No packet available
}

void network_handler(void) {
    // Check for incoming network packets
    struct network_packet incoming;
    
    if (network_receive_packet(&incoming) == 0) {
        // We received a packet
        if (incoming.dest_id == local_id || incoming.dest_id == 0) {  // 0 = broadcast
            print("[NET] Received: ");
            
            // Print the received data as string (assuming it's text)
            for (uint16_t i = 0; i < incoming.data_length && i < MAX_PACKET_SIZE; i++) {
                if (incoming.data[i] == 0) break;  // Null terminator
                terminal_putchar(incoming.data[i]);
            }
            
            print("\n");
        }
    }
}