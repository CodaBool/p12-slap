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
  provisioner "file" {
    source = "server"
    destination = "/tmp/server"
  }
  provisioner "file" {
    source = "agent.json"
    destination = "/tmp/agent.json"
  }
  provisioner "shell" {
    // environment_vars = [
    //   "FOO=hello world",
    // ]
    inline = [
      "sudo yum update -y -q",
      "sudo yum remove docker-compose -y",
      "sudo groupdel docker",
      "sudo yum clean all",
      "sudo yum makecache",
      "sudo grubby --update-kernel=ALL --remove-args=\"systemd.unified_cgroup_hierarchy=0\"",
      // "sudo yum install git -y -q",
      // "sudo yum install golang -y -q",
      // "git clone https://github.com/CodaBool/p12-slap.git slap",
      // "cd slap",
      "sudo chmod 750 /tmp/server",
      "sudo chown root:root /tmp/server",
      "sudo cp /tmp/server /opt/server",
      "sudo chmod 750 /tmp/agent.json",
      "sudo chown root:root /tmp/agent.json",
      "sudo mkdir opt/aws",
      "sudo cp /tmp/agent.json /opt/aws/agent.json",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:/opt/aws/agent.json",
      // "sudo cp / /opt/server",
      "sudo sh -c \"printf '[Unit]\nDescription=goserver\nAfter=network.target\n\n[Service]\nUser=root\nGroup=root\nRestart=always\nRestartSec=10s\nExecStart=/opt/server\nStandardOutput=file:/var/log/server.log\nStandardError=file:/var/log/server.log\n\n[Install]\nWantedBy=multi-user.target\n' > /etc/systemd/system/server.service\"",
      "sudo systemctl --now enable server",
      "printf \"\nalias reload='sudo systemctl daemon-reload'\nalias start='sudo systemctl start server'\nalias status='systemctl status server'\nalias restart='sudo systemctl restart server'\nalias stop='sudo systemctl stop server'\nalias logs='journalctl -f -u server'\n\" >> ~/.bashrc",
      "sudo rm -rf /var/lib/docker /var/lib/containerd /etc/docker"
    ]
  }
}