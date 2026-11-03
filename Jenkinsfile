// Jenkins CI for the plugin.
//
// Requires JDK 21 on the build agent.
// The built React UI (src/main/webapp/ui/copilot.js) is committed, so the Jenkins build
// does not need Node.js. Run scripts/build.sh locally after changing the UI.
//
// The pipeline runs the plugin tests, packages the HPI, and archives it as a build artifact.
// It does not deploy anything.

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

        stage('Plugin') {
            steps {
                dir('jenkins-plugin') {
                    sh 'java -version'
                    sh './mvnw -B -ntp -Dspotbugs.skip=true package'
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
            echo 'Build failed. Inspect the Plugin stage output.'
        }
    }
}
