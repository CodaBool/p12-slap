provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["919759177803"]
}

data "aws_ami" "image" {
  most_recent = true
  owners = ["self"]
  filter {
    name = "tag:Name"
    values = [var.name]
  }
}

variable "name" {
  type = string
  default = "slap"
}

output "aws" {
  value = data.aws_ami.image.id
}