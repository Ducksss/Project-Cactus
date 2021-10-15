const {GoogleAuth} = require('google-auth-library');

module.exports = {
     getPredictions: async (sentences)=>{
        const modelConfigs = {
            region : 'asia-southeast1-ml',
            projectId : 'rich-involution-329111',
            modelName : 'test_cactus_model'
        };
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
          });
        const client = await auth.getClient();
        const url = `https://${modelConfigs.region}.googleapis.com/v1/projects/${modelConfigs.projectId}/models/${modelConfigs.modelName}:predict`;
        const res = await client.request({ 
            url,
            method: 'POST',
            data: {
                    "instances":sentences
            }
        });
        return res.data;
    }
};


