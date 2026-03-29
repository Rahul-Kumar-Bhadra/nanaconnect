import sys
import asyncio
import warnings

# Add api to system path
sys.path.append('api')
warnings.filterwarnings('ignore')

from api.main import app, lifespan

async def test():
    print("Testing connection to database...")
    async with lifespan(app):
        print("Lifespan block executed (tables created)!")

if __name__ == "__main__":
    asyncio.run(test())
