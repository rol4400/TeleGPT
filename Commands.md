
<!-- SSH to EC2 Instance -->
ssh -i "CAB432 - Ryan.pem" ubuntu@ec2-52-62-201-226.ap-southeast-2.compute.amazonaws.com


sudo cp -v ./docker_boot.service /etc/systemd/system


sudo systemctl enable docker_boot.service
sudo systemctl start docker_boot.service