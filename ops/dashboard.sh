#!/bin/bash


# could be this shebang instead /usr/bin/env bash

if [[ $# -eq 0 ]] ; then
  echo 'provide the private DNS name and the instance ID as 2 arguments respectively'
  exit 1
fi

PRIVATE_DNS_NAME="$1"
INSTANCE_ID="$2"

echo "PRIVATE_DNS_NAME $PRIVATE_DNS_NAME"
echo "INSTANCE_ID $INSTANCE_ID"

DASHBOARD_SOURCECODE=$( jq -n \
  --arg BLUE "#17becf" \
  --arg GREEN "#98df8a" \
  --arg PURPLE "#f468e8" \
  --arg TURQUOISE "#1fb499" \
  --arg BABY_BLUE "#1f77b4" \
  --arg PRIVATE_DNS_NAME "$PRIVATE_DNS_NAME" \
  --arg INSTANCE_ID "$INSTANCE_ID" \
  '{
  "widgets": [
      {
          "height": 6,
          "width": 6,
          "y": 0,
          "x": 0,
          "type": "metric",
          "properties": {
              "view": "timeSeries",
              "stacked": true,
              "metrics": [
                  [ "Slap", "mem_used_percent", "host", $PRIVATE_DNS_NAME, { "color": $GREEN } ]
              ],
              "region": "us-east-1",
              "title": "Memory",
              "legend": {
                  "position": "hidden"
              },
              "yAxis": {
                  "left": {
                      "showUnits": false,
                      "label": ""
                  }
              }
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 0,
          "x": 6,
          "type": "metric",
          "properties": {
              "view": "timeSeries",
              "stacked": true,
              "metrics": [
                  [ "AWS/EC2", "CPUUtilization", "InstanceId", $INSTANCE_ID, { "color": $BLUE } ]
              ],
              "region": "us-east-1",
              "title": "CPU",
              "legend": {
                  "position": "hidden"
              },
              "yAxis": {
                  "left": {
                      "showUnits": false,
                      "label": ""
                  }
              }
          }
      },
      {
          "height": 3,
          "width": 6,
          "y": 6,
          "x": 18,
          "type": "metric",
          "properties": {
              "sparkline": true,
              "view": "singleValue",
              "metrics": [
                  [ "Slap", "net_err_out", "host", $PRIVATE_DNS_NAME, "interface", "ens5", { "label": " " } ]
              ],
              "region": "us-east-1",
              "title": "Errors"
          }
      },
      {
          "height": 3,
          "width": 6,
          "y": 9,
          "x": 18,
          "type": "metric",
          "properties": {
              "sparkline": true,
              "view": "singleValue",
              "metrics": [
                  [ "Slap", "netstat_tcp_established", "host", $PRIVATE_DNS_NAME, { "label": " " } ]
              ],
              "region": "us-east-1",
              "title": "Connections"
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 0,
          "x": 12,
          "type": "metric",
          "properties": {
              "view": "timeSeries",
              "stacked": true,
              "metrics": [
                  [ "Slap", "disk_used_percent", "path", "/", "host", $PRIVATE_DNS_NAME, "device", "nvme0n1p1", "fstype", "xfs", { "color": $PURPLE } ]
              ],
              "region": "us-east-1",
              "title": "Disk",
              "legend": {
                  "position": "hidden"
              },
              "yAxis": {
                  "left": {
                      "showUnits": false,
                      "label": ""
                  }
              }
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 6,
          "x": 0,
          "type": "metric",
          "properties": {
              "view": "gauge",
              "metrics": [
                  [ "Slap", "mem_used_percent", "host", $PRIVATE_DNS_NAME, { "color": $GREEN } ]
              ],
              "region": "us-east-1",
              "yAxis": {
                  "left": {
                      "min": 0,
                      "max": 100
                  }
              },
              "setPeriodToTimeRange": true,
              "stacked": true,
              "legend": {
                  "position": "hidden"
              },
              "title": "Memory"
          }
      },
      {
          "height": 8,
          "width": 6,
          "y": 15,
          "x": 18,
          "type": "metric",
          "properties": {
              "metrics": [
                  [ "AWS/EC2", "NetworkOut", "InstanceId", $INSTANCE_ID, { "color": $TURQUOISE, "label": "Out" } ],
                  [ ".", "NetworkIn", ".", ".", { "color": $BABY_BLUE, "label": "In" } ]
              ],
              "view": "timeSeries",
              "stacked": true,
              "region": "us-east-1",
              "yAxis": {
                  "left": {
                      "showUnits": false,
                      "label": ""
                  },
                  "right": {
                      "showUnits": true
                  }
              },
              "stat": "Average",
              "period": 300,
              "title": "Network"
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 0,
          "x": 18,
          "type": "metric",
          "properties": {
              "metrics": [
                  [ "AWS/EC2", "NetworkPacketsOut", "InstanceId", $INSTANCE_ID, { "color": $TURQUOISE, "label": "Out" } ],
                  [ ".", "NetworkPacketsIn", ".", ".", { "color": $BABY_BLUE, "label": "In" } ]
              ],
              "view": "timeSeries",
              "stacked": true,
              "region": "us-east-1",
              "yAxis": {
                  "left": {
                      "showUnits": false
                  },
                  "right": {
                      "showUnits": false
                  }
              },
              "stat": "Average",
              "period": 300,
              "title": "Packets"
          }
      },
      {
          "height": 3,
          "width": 6,
          "y": 12,
          "x": 18,
          "type": "metric",
          "properties": {
              "metrics": [
                  [ "Slap", "processes_total", "host", $PRIVATE_DNS_NAME, { "label": " " } ]
              ],
              "sparkline": true,
              "view": "singleValue",
              "region": "us-east-1",
              "stat": "Average",
              "period": 300,
              "title": "Processes"
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 6,
          "x": 6,
          "type": "metric",
          "properties": {
              "view": "gauge",
              "metrics": [
                  [ "AWS/EC2", "CPUUtilization", "InstanceId", $INSTANCE_ID, { "color": $BLUE } ]
              ],
              "region": "us-east-1",
              "yAxis": {
                  "left": {
                      "min": 0,
                      "max": 100
                  }
              },
              "legend": {
                  "position": "hidden"
              },
              "stacked": true,
              "title": "CPU"
          }
      },
      {
          "height": 6,
          "width": 6,
          "y": 6,
          "x": 12,
          "type": "metric",
          "properties": {
              "view": "gauge",
              "metrics": [
                  [ "Slap", "disk_used_percent", "path", "/", "host", $PRIVATE_DNS_NAME, "device", "nvme0n1p1", "fstype", "xfs", { "color": $PURPLE } ]
              ],
              "region": "us-east-1",
              "yAxis": {
                  "left": {
                      "min": 0,
                      "max": 100
                  }
              },
              "legend": {
                  "position": "hidden"
              },
              "title": "Disk"
          }
      },
      {
          "type": "log",
          "x": 0,
          "y": 12,
          "width": 18,
          "height": 11,
          "properties": {
              "query": "SOURCE '/aws/ec2/slap' | fields @timestamp, @message\n| sort @timestamp desc\n| limit 100",
              "region": "us-east-1",
              "stacked": false,
              "view": "table"
          }
      }
  ]
}' )

echo $DASHBOARD_SOURCECODE

aws cloudwatch put-dashboard --dashboard-name "Slap" --dashboard-body "$DASHBOARD_SOURCECODE"