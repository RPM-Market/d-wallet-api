#!/bin/bash
docker-compose pull && docker-compose down && docker-compose up -d
echo "Finished. run 'docker system prune'"