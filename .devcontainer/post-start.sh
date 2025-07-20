#!/bin/bash

# Add postgres host entry to /etc/hosts
echo '127.0.0.1 postgres' | sudo tee -a /etc/hosts

# Add more post-start commands here as needed