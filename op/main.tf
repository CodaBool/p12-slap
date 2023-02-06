provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["919759177803"]
}

terraform {
  required_version = ">= 1.3.6, < 2.0.0"
  backend "s3" {
    bucket = "codabool-tf"
    key    = "slap.tfstate"
    region = "us-east-1"
  }
}

# TODO: this could potentially raise the price
module "ec2" {
  source   = "github.com/CodaBool/AWS/modules/ec2"
  ami_name = var.ami_name
  name     = "slap"
  price    = data.external.lowest_price.result.price
}

data "external" "lowest_price" {
  program = ["bash", "price.sh"]
}

output "price" {
  value = data.external.lowest_price.result.price
}

variable "unique_ami_name" {
  type = string
}