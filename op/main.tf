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

module "ec2" {
  source = "github.com/CodaBool/AWS/modules/ec2"
  ami = "ami-0720d270ba3fe7787"
}