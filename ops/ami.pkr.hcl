packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "unique_ami_name" {
  type = string
}

variable "common_ami_name" {
  type = string
  default = "slap"
}

source "amazon-ebs" "al2" {
  ami_name      = var.unique_ami_name
  instance_type = "t4g.nano"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name                = "al2*"
      architecture        = "arm64"
    }
    most_recent = true
    owners      = ["amazon"]
  }
  ssh_username = "ec2-user"
  tags = {
    Name = var.common_ami_name
  }
}

build {
  name = "learn-packer"
  sources = [
    "source.amazon-ebs.al2"
  ]
  // provisioner "file" {
  //   source = "server"
  //   destination = "/tmp/server"
  // }
  provisioner "file" {
    source = "agent.json"
    destination = "/tmp/agent.json"
  }

  // I used a gist guide on how to setup log agent as well as the AWS docs
  // gist = https://gist.github.com/adam-hanna/06afe09209589c80ba460662f7dce65c
  // docs = https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html 
  provisioner "shell" {
    // environment_vars = [
    //   "FOO=hello world",
    // ]
    inline = [
      "sudo yum update -y -q",

      // AWS monitoring
      "sudo yum install amazon-cloudwatch-agent -y -q",

      // curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
      // sudo yum install nodejs -y

      // remove docker
      "sudo yum remove docker -y -q",
      "sudo groupdel docker",
      "sudo yum clean all",
      "sudo yum makecache",
      "sudo grubby --update-kernel=ALL --remove-args=\"systemd.unified_cgroup_hierarchy=0\"",

      // install node
      "sudo yum install git -y -q",
      "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash",
      ". ~/.nvm/nvm.sh",
      "nvm install --lts",
      "git clone https://github.com/CodaBool/p12-slap.git slap",
      "cd slap && npm install --omit=dev",
      // "VERSION=$(ls -U /home/ec2-user/.nvm/versions/node/ | head -1)",
      // "sudo sh -c \"printf 'alias node=\"/home/ec2-user/.nvm/versions/node/$VERSION/bin/node\"' >> /root/.bashrc\"",
      "sudo ln -s '$NVM_DIR/versions/node/$(nvm version)/bin/node' '/usr/local/bin/node'",
      "sudo ln -s '$NVM_DIR/versions/node/$(nvm version)/bin/npm' '/usr/local/bin/npm'",

      // install pm2
      // "npm install pm2@latest -g"
      // "sudo yum install golang -y -q",
      // "cd slap",

      // add Go binary
      // "sudo chmod 750 /tmp/server",
      // "sudo chown root:root /tmp/server",
      // "sudo cp /tmp/server /opt/server",

      // add monitoring config
      "sudo chmod 750 /tmp/agent.json",
      "sudo chown root:root /tmp/agent.json",
      "sudo cp /tmp/agent.json /opt/aws/agent.json",

      // start monitoring process
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/agent.json",

      // create service
      "sudo sh -c \"printf '[Unit]\nDescription=node-server\nAfter=network.target\n\n[Service]\nUser=root\nGroup=root\nRestart=always\nRestartSec=10s\nExecStart=node server.js\nWorkingDirectory=/home/ec2-user/slap\nStandardOutput=file:/var/log/server.log\nStandardError=file:/var/log/server.log\n\n[Install]\nWantedBy=multi-user.target\n' > /etc/systemd/system/server.service\"",

      // start service
      "sudo systemctl --now enable server",

      // create some aliases for fast commands
      "printf \"\nalias reload='sudo systemctl daemon-reload'\nalias start='sudo systemctl start server'\nalias status='systemctl status server'\nalias watch='sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/agent.json'\nalias restart='sudo systemctl restart server'\nalias stop='sudo systemctl stop server'\nalias logs='journalctl -f -u server'\n\" >> ~/.bashrc",

      // remove docker folders
      "sudo rm -rf /var/lib/docker /var/lib/containerd /etc/docker"
    ]
  }
}



/*

sudo sh -c \"printf 'alias node=\"/home/ec2-user/.nvm/versions/node/$VERSION/bin/node\"' >> /root/.bashrc\"


ExecStart=npm run prod
WorkingDirectory=/opt/server

pm2 stop main

53M
9M

npm install --omit=dev


one guide suggested pm2 put logs at  /home/safeuser/.pm2/logs/app-err.log.

# question
- find out what `pm2 startup -u safeuser` does


filter @logStream = 'log'
 | fields datefloor(@timestamp, 1s) as time
#  | parse @timestamp "*" as year, month, day, other
#  | filter @message like /URL query contains semicolon, which is no longer a supported separator/
 | filter @message like /debug/
 | parse time "*-*-*" as simpleTime, th1, th3
 | parse  @message '"level":"*"' as level
 | parse  @message '"message":"*"' as message



sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080

delete
sudo iptables -t nat -D PREROUTING 1

list
sudo iptables -t nat -v -L PREROUTING -n --line-number

stackoverflow with tomcat 



sudo iptables -A INPUT -i eth0 -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -i eth0 -p tcp --dport 8080 -j ACCEPT
sudo iptables -A FORWARD -p tcp --dport 80 -j ACCEPT
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080


medium article
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 9000


enable routing
echo 1 > /proc/sys/net/ipv4/ip_forward

save iptables
iptables-save > /etc/sysconfig/iptables #IPv4


sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
*/