#!/bin/bash

# List of network interfaces to ping from
interfaces=(
  "lo"
  "venet0"
  "as0t0"
  "as0t1"
  "as0t2"
  "as0t3"
  "as0t4"
  "as0t5"
  "as0t6"
  "as0t7"
)

# Function to perform ping for each network interface
perform_ping() {
  for interface in "${interfaces[@]}"; do
    # Extract the IP address from the interface information
    ip_address=$(ip a show dev $interface | awk '/inet /{print $2}' | cut -d '/' -f 1)

    if [ -n "$ip_address" ]; then
      echo "Pinging from $interface ($ip_address)..."
      ping -c 4 172.27.224.7  # Ping the target address (e.g., 172.27.224.7)
      echo "------------------------"
    else
      echo "No IP address found for $interface."
    fi
  done
}

# Execute the ping function
perform_ping
