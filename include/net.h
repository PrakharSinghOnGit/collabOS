#ifndef NET_H
#define NET_H

#include <stdint.h>

// Network configuration
#define MAX_PACKET_SIZE 1024
#define NETWORK_PORT 8080

// Simple packet structure for inter-VM communication
struct network_packet {
    uint32_t source_id;
    uint32_t dest_id;
    uint16_t data_length;
    uint8_t data[MAX_PACKET_SIZE];
};

// Function declarations
void network_initialize(void);
int network_send_packet(struct network_packet* packet);
int network_receive_packet(struct network_packet* packet);
void network_handler(void);

#endif