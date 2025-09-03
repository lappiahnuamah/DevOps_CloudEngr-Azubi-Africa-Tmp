// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_USERNAME = credentials('dockerhub-username') // Jenkins credential ID
//         DOCKERHUB_TOKEN    = credentials('dockerhub-token')    // Jenkins credential ID
//         IMAGE_NAME         = "clms-backend"
//         TAG                = "v${BUILD_NUMBER}"
//         LATEST_TAG         = "latest"
//         // Uncomment and set these if you want to push to ECR
//         // AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
//         // AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
//         // AWS_REGION            = 'us-east-1'
//         // ECR_REGISTRY          = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
//         // ECR_REPO              = 'clms-backend'
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 dir('project_two/back-end') {
//                     script {
//                         sh """
//                         docker build -t $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG .
//                         docker tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG $DOCKERHUB_USERNAME/$IMAGE_NAME:$LATEST_TAG
//                         """
//                     }
//                 }
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                 withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN')]) {
//                     sh """
//                     echo $DOCKERHUB_TOKEN | docker login -u $DOCKERHUB_USERNAME --password-stdin
//                     docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG
//                     docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$LATEST_TAG
//                     docker logout
//                     """
//                 }
//             }
//         }

//         // Uncomment for ECR support
//         /*
//         stage('Push to ECR') {
//             steps {
//                 withCredentials([
//                     string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
//                     string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
//                 ]) {
//                     sh '''
//                     aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
//                     aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
//                     aws configure set default.region $AWS_REGION
//                     aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
//                     docker tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$TAG $ECR_REGISTRY/$ECR_REPO:$TAG
//                     docker tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$LATEST_TAG $ECR_REGISTRY/$ECR_REPO:$LATEST_TAG
//                     docker push $ECR_REGISTRY/$ECR_REPO:$TAG
//                     docker push $ECR_REGISTRY/$ECR_REPO:$LATEST_TAG
//                     docker logout $ECR_REGISTRY
//                     '''
//                 }
//             }
//         }
//         */
//     }
// }

// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
//         IMAGE_NAME   = "clms-backend-jenkins"
//         TAG          = "v${BUILD_NUMBER}"
//         LATEST_TAG   = "latest"
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 dir('project_two/back-end') {
//                     bat """
//                     docker build -t %IMAGE_NAME%:%TAG% .
//                     docker tag %IMAGE_NAME%:%TAG% %IMAGE_NAME%:%LATEST_TAG%
//                     """
//                 }
//             }
//         }

//         stage('Push to Docker Hub') {
//             steps {
//                     bat """
//                     docker tag %IMAGE_NAME%:%TAG% %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%TAG%
//                     docker tag %IMAGE_NAME%:%LATEST_TAG% %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%LATEST_TAG%
//                     echo %DOCKERHUB_TOKEN% | docker login -u %DOCKERHUB_USERNAME% --password-stdin
//                     docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%TAG%
//                     docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%LATEST_TAG%
//                     docker logout
//                     """
//                 }
//             }
//         }
//     }
// }

pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-id')
        IMAGE_NAME = "clms-backend-jenkins"
        TAG = "v${BUILD_NUMBER}"
        LATEST_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('project_two/back-end') {
                    bat """
                        docker build -t %DOCKERHUB_CREDENTIALS_USR%/%IMAGE_NAME%:%TAG% .
                        docker tag %DOCKERHUB_CREDENTIALS_USR%/%IMAGE_NAME%:%TAG% %DOCKERHUB_CREDENTIALS_USR%/%IMAGE_NAME%:%LATEST_TAG%
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-id', 
                                                usernameVariable: 'DOCKERHUB_USERNAME', 
                                                passwordVariable: 'DOCKERHUB_TOKEN')]) {
                    bat """
                        echo %DOCKERHUB_TOKEN%| docker login -u %DOCKERHUB_USERNAME% --password-stdin
                        docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%TAG%
                        docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%LATEST_TAG%
                        docker logout
                    """
                }
            }
        }
    }

    post {
        always {
            bat 'docker logout'
        }
    }
}