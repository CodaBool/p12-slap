#!/bin/bash
ids=$(aws ec2 describe-images --owners self | jq -r ".Images[].ImageId")
for i in $ids
do
  value=$(aws ec2 describe-instances --filters "Name=image-id,Values=$i" | jq -r ".Reservations[].OwnerId")
  if [ ! "$value" ]; then
    echo "removing $i"
    aws ec2 deregister-image --image-id $i
  fi
done