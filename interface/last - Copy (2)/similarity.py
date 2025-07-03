import torch
import torch.nn.functional as F
import numpy as np
from Siamese import SiameseModel
from preprosseing import imshow,load_signature,preprocess_signature
import torchvision


def detect_similarity(model_similarity, real_img, img, threshold=0.5):
    canvas_size = (952, 1360)
    img_size = (128, 128)
    input_size = (256, 256)

    label_dict = {1.0:'Forged', 0.0:'Original'}
    model = SiameseModel()
    model.load_state_dict(torch.load(model_similarity, map_location=torch.device('cpu'))['model'])
    model.eval()


    img1,img2 = __getitem__(real_img,img)


    concatenated = torch.cat((img1, img2),0)
    with torch.no_grad():
        op1, op2, confidence = model(img1.to('cpu'), img2.to('cpu'))
    confidence = confidence.sigmoid().detach().to('cpu')

    cos_sim = F.cosine_similarity(op1, op2)
    prediction = np.where(cos_sim<=threshold, 1, 0)

    if prediction[0] == 0.0:
        confidence = 1 - confidence


    #imshow(torchvision.utils.make_grid(concatenated.unsqueeze(0)), f'similarity: {cos_sim.item():.2f} Confidence: {confidence.item():.2f} Label: {label_dict[prediction[0]]}')
    #plt.savefig('siamese.png')



    L = ['Similar','Not-Similar']


    return cos_sim.item(),confidence.item(),label_dict[prediction[0]]

def __getitem__(real_file_path,test_file_path,canvas_size = (952, 1360),dim=(256, 256)):
      # getting the image path


    img1 = load_signature(real_file_path)
    img2 = load_signature(test_file_path)

    img1 = preprocess_signature(img1, canvas_size,dim)
    img2 = preprocess_signature(img2, canvas_size,dim)
    return torch.tensor(img1), torch.tensor(img2)