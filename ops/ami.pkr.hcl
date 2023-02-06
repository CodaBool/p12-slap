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
  provisioner "shell" {
    // environment_vars = [
    //   "FOO=hello world",
    // ]
    inline = [
      // "sudo yum update -y -q",
      // "sudo yum install git -y -q",
      // "sudo yum install golang -y -q",
      // "git clone https://github.com/CodaBool/p12-slap.git slap",
      // "cd slap",
      "sudo chmod 750 /tmp/server",
      "sudo chown root:root /tmp/server",
      "sudo cp /tmp/server /opt/server",
      // "sudo cp / /opt/server",
      "sudo sh -c \"printf '[Unit]\nDescription=goserver\nAfter=network.target\n\n[Service]\nUser=root\nGroup=root\\nRestart=always\\nRestartSec=10s\\nExecStart=/opt/server\n\n[Install]\nWantedBy=multi-user.target\n' > /etc/systemd/system/server.service\"",
      "sudo systemctl --now enable server",
      "printf \"\nalias reload='sudo systemctl daemon-reload'\nalias start='sudo systemctl start server'\nalias status='systemctl status server'\nalias restart='sudo systemctl restart server'\nalias stop='sudo systemctl stop server'\nalias logs='journalctl -f -u server'\n\" >> ~/.bashrc"
    ]
  }
}