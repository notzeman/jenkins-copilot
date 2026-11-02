// Jenkins CI for the plugin.
//
// Required Jenkins tool installations (Manage Jenkins -> Tools):
//   - jdk21    : JDK 21
//   - nodejs24 : Node.js 24
//
// The pipeline builds the React UI, runs the plugin tests, packages the HPI,
// and archives it as a build artifact. It does not deploy anything.

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Clean') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend') {
            steps {
                dir('jenkins-plugin/src/main/frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Plugin') {
            steps {
                dir('jenkins-plugin') {
                    sh './mvnw -B -ntp -Dspotbugs.skip=true test package'
                }
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'jenkins-plugin/target/*.hpi', fingerprint: true
            }
        }
    }

    post {
        always {
            junit testResults: 'jenkins-plugin/target/surefire-reports/*.xml', allowEmptyResults: true
        }
        success {
            echo 'HPI built: jenkins-plugin/target/jenkins-ai-copilot.hpi'
        }
        failure {
            echo 'Build failed. Inspect the Frontend or Plugin stage output.'
        }
    }
}
