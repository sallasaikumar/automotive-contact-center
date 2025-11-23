"""
AWS Architecture Diagram Generator
Creates a professional architecture diagram for the Automotive Intelligent Contact Center
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.network import APIGateway, CloudFront
from diagrams.aws.database import Dynamodb
from diagrams.aws.storage import S3
from diagrams.aws.ml import Bedrock
from diagrams.aws.management import Cloudwatch
from diagrams.aws.security import IAM, WAF
from diagrams.aws.integration import Eventbridge, StepFunctions
from diagrams.aws.analytics import Quicksight
from diagrams.onprem.client import Users

# Configure diagram
graph_attr = {
    "fontsize": "16",
    "bgcolor": "white",
    "pad": "0.5",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.0"
}

node_attr = {
    "fontsize": "12",
    "height": "1.2",
    "width": "1.2"
}

edge_attr = {
    "fontsize": "10"
}

with Diagram(
    "Automotive Intelligent Contact Center - AWS Architecture",
    filename="aws_architecture_diagram",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    # Users
    users = Users("Users\n(Web/Mobile/Vehicle)")
    
    # Security Layer
    with Cluster("Security Layer"):
        waf = WAF("AWS WAF\nDDoS Protection")
        iam = IAM("IAM\nAuthentication")
    
    # CDN & API Layer
    with Cluster("API & CDN Layer"):
        cdn = CloudFront("CloudFront\nGlobal CDN")
        api = APIGateway("API Gateway\nREST + WebSocket")
    
    # Orchestration Layer
    with Cluster("Orchestration Layer"):
        step_functions = StepFunctions("Step Functions\nWorkflow")
        eventbridge = Eventbridge("EventBridge\nEvent Bus")
    
    # Agent Layer (Lambda Functions)
    with Cluster("AI Agent Layer (14 Agents + 3 MCP)"):
        with Cluster("Core Agents"):
            supervisor = Lambda("Supervisor\nAgent")
            intent = Lambda("Intent\nAnalysis")
            sentiment = Lambda("Sentiment\nAnalysis")
            routing = Lambda("Routing\nAgent")
        
        with Cluster("Enhanced Agents"):
            knowledge = Lambda("Knowledge\nRetrieval")
            personalization = Lambda("Personalization\nAgent")
            response = Lambda("Response\nGeneration")
        
        with Cluster("Advanced Features"):
            cockpit = Lambda("Cockpit\nAssistant")
            recommendations = Lambda("Product\nRecommendations")
            insights = Lambda("CDH\nInsights")
        
        with Cluster("Agentic Core"):
            reasoning = Lambda("Reasoning\nEngine")
            learning = Lambda("Learning\nSystem")
        
        with Cluster("MCP Servers"):
            vehicle_mcp = Lambda("Vehicle\nDesign MCP")
            journey_mcp = Lambda("Customer\nJourney MCP")
            market_mcp = Lambda("Market\nIntelligence MCP")
    
    # AI/ML Layer
    with Cluster("AI/ML Services"):
        bedrock = Bedrock("Amazon Bedrock\nClaude 3 / Titan\nReal-time Inference")
    
    # Data Layer
    with Cluster("Data Layer"):
        dynamodb = Dynamodb("DynamoDB\nCustomers\nSessions\nAnalytics")
        s3 = S3("S3\nKnowledge Base\nDocuments\nAssets")
    
    # Monitoring & Analytics
    with Cluster("Monitoring & Analytics"):
        cloudwatch = Cloudwatch("CloudWatch\nLogs & Metrics\nReal-time Monitoring")
        quicksight = Quicksight("QuickSight\nDashboards")
    
    # Define connections
    users >> Edge(label="HTTPS") >> waf
    waf >> cdn
    cdn >> Edge(label="API Calls") >> api
    api >> iam
    
    # API to Orchestration
    api >> Edge(label="Events") >> eventbridge
    api >> Edge(label="Workflows") >> step_functions
    
    # Orchestration to Agents
    step_functions >> supervisor
    eventbridge >> supervisor
    
    # Supervisor orchestrates all agents
    supervisor >> Edge(label="Orchestrate", color="blue") >> [intent, sentiment, routing]
    supervisor >> Edge(label="Orchestrate", color="blue") >> [knowledge, personalization, response]
    supervisor >> Edge(label="Orchestrate", color="blue") >> [cockpit, recommendations, insights]
    supervisor >> Edge(label="Orchestrate", color="purple") >> [reasoning, learning]
    supervisor >> Edge(label="MCP Protocol", color="green") >> [vehicle_mcp, journey_mcp, market_mcp]
    
    # Agents to AI/ML
    [intent, sentiment, response, reasoning, learning] >> Edge(label="LLM Inference", color="red") >> bedrock
    
    # Agents to Data
    [knowledge, personalization, insights] >> Edge(label="Read/Write") >> dynamodb
    knowledge >> Edge(label="Retrieve") >> s3
    [vehicle_mcp, journey_mcp, market_mcp] >> Edge(label="Data Access", color="green") >> dynamodb
    
    # Monitoring
    [supervisor, intent, sentiment, routing, knowledge, personalization, response] >> Edge(label="Logs", color="orange") >> cloudwatch
    [cockpit, recommendations, insights, reasoning, learning] >> Edge(label="Logs", color="orange") >> cloudwatch
    [vehicle_mcp, journey_mcp, market_mcp] >> Edge(label="Logs", color="orange") >> cloudwatch
    
    cloudwatch >> Edge(label="Visualize") >> quicksight

print("✅ AWS Architecture Diagram created successfully!")
print("📄 Output file: aws_architecture_diagram.png")
print("\n📊 Architecture includes:")
print("  - 17 Components (14 Agents + 3 MCP Servers)")
print("  - 10 AWS Services")
print("  - Real-time data flows")
print("  - Security layers")
print("  - Monitoring & analytics")
