# Llama Hackathon 2025 - Zenarth AI Team

## Problem Definition

Small-scale startups and individual developers often lack the resources to monitor their web applications 24/7. Unexpected errors such as service outages, broken images, or faulty user interface elements can remain undetected in the system for hours. This situation negatively affects user experience, leading to revenue loss and reputation damage. Current monitoring tools are generally limited to detecting errors; they lack the ability to fix these errors in real-time or reflect them properly to users. As a result, developers are still dependent on manual intervention and time loss, creating serious inefficiency.

## Solution

Zen AI offers an intelligent, self-healing web monitoring system based on Llama 3.1-8B, designed for small teams and individual developers. Zen AI actively scans the web application every 10 seconds, detects potential errors, and categorizes them into three categories: simple, medium, and critical. Simple errors are automatically fixed by the system, ensuring uninterrupted user experience and eliminating the need for developers to spend time on minor problems. For medium-level errors, Zen AI automatically masks the relevant area with "Under Maintenance" or "Fixing" messages and sends instant notifications to developers, while users have a more positive experience as they don't see error messages. Critical errors that affect the core functionality of the application are left as "error" and urgent alerts are sent to developers.

This structure enables Zen AI to transform web applications into intelligent systems that can self-repair, protect users from errors instantly, and require minimal developer intervention. This way, both user satisfaction increases and the developer's workload on the system decreases.

## Infrastructure

LLAMA3.1-8b hosted on vast.ai

1. Clone the repository
2. Install the requirements - ollama
3. Open the jupyter notebook fill the prompts and system instructions in the code and run the code

## Team Members

1. Utkan Başurgan
2. Batuhan Odçıkın
3. Kamran Yağız Yaldız
4. Burak Yunus Belen

## Codebase Structure

The Zenarth AI system consists of several interconnected components that work together to provide intelligent web monitoring and self-healing capabilities:

### Core Components

#### 1. **APP_Api/** - AI Analysis Engine
- **`main.py`**: Main orchestrator that runs the complete pipeline (Collect → Analyze → Apply)
- **`llama_error_analysis.py`**: Core AI analysis module that processes error logs and generates fixes using Llama 3.1
- **`find_func.py`**: Context collection module that gathers relevant code files for analysis
- **`apply_code_changes.py`**: Code application module that implements AI-generated fixes
- **`python_api.py`**: SSH connection handler for remote Llama model execution
- **Configuration files**: `system_prompt.txt`, `prompt_format.txt`, `model_config.txt`

#### 2. **APP_Backend/** - Continuous Monitoring Service
- **`MainRunner.py`**: Continuous monitoring daemon that runs every 10 seconds
- Executes the AI analysis pipeline automatically
- Monitors target applications and triggers fixes when errors are detected

#### 3. **APP_Main/** - Web Dashboard Interface
- **React-based dashboard** for monitoring and managing the AI system
- **`src/01_controllers_daemons/`**: Main UI controllers
  - `dashboards_controllers/`: Dashboard components (Console, Management, Overview, Settings)
  - `sites_controllers/`: Website and authentication components
- **`src/02_softwares_daemons/`**: AI service integration
- **`src/03_datas_daemons/`**: Data management and session handling
- **`src/04_settings_daemons/`**: SSH and configuration management

#### 4. **TESTS_Main/** - Test Applications
- **`myapp/`**, **`myapp3/`**, **`test/`**: Sample React applications used for testing
- These applications serve as targets for the AI monitoring system
- Include logging mechanisms to capture errors for analysis

### How the System Works

1. **Monitoring Phase**: The `MainRunner.py` continuously monitors target applications every 10 seconds
2. **Error Detection**: When errors are detected in application logs, the system triggers the analysis pipeline
3. **Context Collection**: `find_func.py` gathers relevant code files and context around the error
4. **AI Analysis**: `llama_error_analysis.py` sends the context to Llama 3.1 model via SSH for analysis
5. **Fix Generation**: The AI model analyzes the error and generates appropriate fixes
6. **Code Application**: `apply_code_changes.py` applies the generated fixes to the target application
7. **Dashboard Monitoring**: The web interface provides real-time monitoring and management capabilities

### Key Features

- **Self-healing**: Automatically fixes simple errors without developer intervention
- **Smart masking**: Covers medium-level errors with maintenance messages
- **Critical alerts**: Notifies developers immediately for critical issues
- **Real-time monitoring**: Continuous 10-second monitoring cycle
- **Remote AI processing**: Uses Azure GPU VM with A100 GPU for Llama model inference
- **Comprehensive logging**: Detailed error analysis reports stored in `error_analysis_reports/`

The system is designed to minimize developer workload while ensuring optimal user experience through intelligent error handling and automatic remediation.
