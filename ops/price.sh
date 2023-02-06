#!/bin/bash

# get lowest price spot price for t4g.nano in us-east-1a
PRICE=$(aws --region=us-east-1 ec2 describe-spot-price-history --instance-types t4g.nano --start-time=$(date +%s) --product-descriptions="Linux/UNIX" --query 'SpotPriceHistory[*].{az:AvailabilityZone, price:SpotPrice}' | jq -r ".[] | select(.az == \"us-east-1a\") | .price")
jq -n --arg price "$PRICE" '{"price":$price}'