# Analytics Hub

Analytics Hub is an intelligent data analytics platform that automatically preprocesses datasets and identifies the best machine learning model for making predictions. Built with modern web technologies and deployed on AWS infrastructure, it provides a seamless experience for data scientists and analysts.

## Features

- **Automated Data Preprocessing**: Leverages EvalML's powerful preprocessing capabilities to clean and prepare your data
- **Intelligent Model Selection**: Automatically evaluates multiple machine learning models and recommends the best performer
- **Interactive Web Interface**: Modern, responsive frontend built with Next.js for intuitive data exploration
- **Scalable Cloud Infrastructure**: Deployed on AWS EC2 with Docker containerization for reliable performance
- **Notebook Integration**: Uses Papermill for parameterized notebook execution and reporting

## Technology Stack

### Frontend
- **Next.js**: React-based framework for server-side rendering and optimal performance
- **JavaScript**: Modern ES6+ for dynamic user interactions

### Backend & ML
- **Python**: Core machine learning and data processing logic
- **EvalML**: AutoML library for automated model selection and evaluation
- **Papermill**: Notebook parameterization and execution engine

### Infrastructure
- **AWS EC2**: Cloud computing platform for scalable deployment
- **Docker**: Containerization for consistent environments across development and production

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Docker
- AWS CLI (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd analytics-hub
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Start the development servers**
   ```bash
   # Frontend (Next.js)
   npm run dev
   
   # Backend (Python API)
   python app.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t analytics-hub .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -p 8000:8000 analytics-hub
   ```

### AWS EC2 Deployment

1. **Launch EC2 instance**
   - Use Amazon Linux 2 or Ubuntu AMI
   - Configure security groups for ports 3000, 8000, and 22

2. **Deploy using Docker**
   ```bash
   # SSH into your EC2 instance
   ssh -i your-key.pem ec2-user@your-instance-ip
   
   # Install Docker
   sudo yum update -y
   sudo yum install docker -y
   sudo service docker start
   
   # Pull and run your containerized application
   docker pull your-registry/analytics-hub
   docker run -d -p 3000:3000 -p 8000:8000 analytics-hub
   ```

## Usage

1. **Upload Dataset**: Use the web interface to upload your CSV or structured data file
2. **Data Preprocessing**: The system automatically preprocesses your data using EvalML's built-in capabilities
3. **Model Training**: Multiple ML models are trained and evaluated automatically
4. **Results**: View model performance metrics and select the best model for your use case
5. **Predictions**: Make predictions on new data using the selected model


## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
AWS_REGION=us-east-1
DOCKER_REGISTRY=your-registry-url
```

### EvalML Configuration

The EvalML pipeline can be customized in `config/evalml_config.py`:

```python
EVALML_CONFIG = {
    "problem_type": "auto",
    "max_iterations": 10,
    "patience": 5,
    "tolerance": 0.01
}
```



## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request


## Performance Optimization

- **Caching**: Redis integration for model caching
- **Load Balancing**: AWS Application Load Balancer support
- **Auto Scaling**: EC2 Auto Scaling Group configuration
- **Database**: PostgreSQL for persistent storage

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
