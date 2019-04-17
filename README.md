# simple_dockerised_node

## Copied from...
https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
$ curl localhost:8081

## Deploy to AWS ECS

### Publish to ECR
1. Install the AWS CLI
2. Get AWS access key needed to issue CLI commands
3. Get the login command from the ECR console, e.g. $(aws ecr get-login --no-include-email --region eu-west-1)
4. Tag your docker images with the name of the repo so that Docker knows where to put it, e.g. docker tag e9ae3c220b23 aws_account_id.dkr.ecr.region.amazonaws.com/my-web-app (where my-web-app is the name of the repo)
5. Publish the image, e.g. docker push aws_account_id.dkr.ecr.region.amazonaws.com/my-web-app:latest (latest will appear as the image tag in the my-web-app repo)

### Publish to Docker Hub
1. docker login -- deanorogers / ...
2. docker build . -t <hub-user>/<repo-name>[:<tag>], e.g. docker build -t deanorogers/deanorogers-repo .
3. OR tag an existing image, e.g. docker tag e9ae3c220b23 deanorogers/deanorogers-repo
4. Where necessary, logout of Docker hub using > git config --global --unset credential.helper
5. $ docker image push deanorogers/deanorogers-repo

### Create EC2 instance
1. Creating an IAM Security Group for SSH (restricted) and HTTP (open)
2. Create an IAM Role to give EC2 access to ECS services with the AmazonEC2ContainerServiceforEC2Role policy.
3. Restrict access to PEM key by removing: chmod go-r my-key.pem
4. Add Docker hub credentials to the /etc/ecs directory:
ECS_ENGINE_AUTH_TYPE=docker
ECS_ENGINE_AUTH_DATE={"https://index.docker.io/v1/":{"username":"my-username","password":"my-password","email":"my-email@yahoo.co.uk"}}
4.1 As user data ...
#!/bin/bash
echo ECS_CLUSTER=my-ecs-cluster >> /etc/ecs/ecs.config
5. Restart the ecs agent: docker stop ecs-agent.
6. docker inspect ecs-agent | grep Status
7. Try stopping the EC2 instance to see if the ecs.config file persists. Otherwise create an EBS storage volume. Yes - the file does persist, may have to re-start the ecs service however.
8. aws ec2 describe-instances
9. aws ec2 start-instances --instance-ids "{InstanceId}"
10 Ensure Security Group allows All TCP from a range of dynamic ports accepting traffic from LB.

### Create Cluster, Task, Container and service
1. Note => With the Classic LB, only one task allowed per container instance.
2. If service creation fails, you may need to delete the Route53 entry from the command line =>
aws servicediscovery list-services / aws servicediscovery delete-service --id "srv-suxx4jawwtvzv5ih"
3. Ensure host and container port mappings are correct - consistent with the port on which the server is listening.
4. curl the public IP of the EC2 instance before testing via the LB

### Auto-scaling container/task instances
1. Do I need an NLB or ALB to support > 1 container/task on the same EC2 instance? yes.
2. Ensure to create ALB/NLB and TG in the same VPC.
3. Ensure Sec Grp of EC2 instance accepts traffic from  NLB using dynamic port allocation.

### Update the image in the Docker Registry
1. Add a simple log command on the GET method of the Node server.
2. Alter Jenkins port from 8080 to 9090.
3. Test using Docker run and tailing the logs. $ docker logs -f <container-id>
4. Publish to docker Registry.
5. [TODO] Determine if new image is pulled when service is re-started.
6. [TODO] Force a refresh with command
# aws ecs update-service --cluster <cluster name> --service <service name>
7. Obtain the container ports from Target Group and test (curl) from the participating ec2 instances.
