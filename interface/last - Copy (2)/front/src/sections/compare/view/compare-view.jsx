/* eslint-disable */

import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { CardMedia } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import Confidence from '../../overview/confidence';
import axios from 'axios';


// ----------------------------------------------------------------------

const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post(
    'http://127.0.0.1:5000/api/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      mode: 'no-cors',
    },
  );

  return data;
};

const compareImages = async (firstId, secondId) => {
  const req = {
    real_image_id: firstId,
    new_image_id: secondId,
  };

  const { data } = await axios.post('http://127.0.0.1:5000/api/compare', req, {
    headers: {
      'Content-Type': 'application/json',
      'Sec-Fetch-Mod': 'no-cors',
    },
    mode: 'no-cors',
  });

  return data;
};

export default function CompareView() {
  const [images, setImages] = useState([]);
  const [compareRes, setCompareRes] = useState(null);


  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    const image = {
      file: file,
    };

    if (file) {
      const res = await uploadImage(file);
      image.id = res.id;
    }

    setImages(prev => [image, ...prev]);
  };

  const handleReset = () => {
    setImages([]);
    setCompareRes(null);
  };

  const handleCompare = async () => {
    const [first, second] = images;
    const res = await compareImages(first.id, second.id);
    setCompareRes(res);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Compare Signature</Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          {
            images.length < 2 ? (
              <div>
                <input
                  accept="image/*"
                  id="image1-upload"
                  type="file"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image1-upload">
                  <Button variant="contained" color="inherit" component="span"
                          startIcon={<Iconify icon="eva:plus-fill" />}>
                    New Image
                  </Button>
                </label>
              </div>
            ) : (
              <Button variant="contained" color="inherit" component="span" disabled={true}
                      startIcon={<Iconify icon="eva:plus-fill" />}>
                New Image
              </Button>
            )
          }

          <Button variant="contained" color="inherit" component="span" disabled={images.length < 2}
                  onClick={handleCompare}>
            Compare
          </Button>

          <Button variant="contained" color="inherit" component="span" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
      </Stack>

      {
        compareRes && (
          <div style={{ marginBottom: '24px' }}>
            <Confidence
              title={'Result : ' + compareRes?.label || ''}
              chart={{
                series: [
                  { label: 'Similarity', value: compareRes.similarity },
                  { label: 'Confidence', value: compareRes.confidence },
                ],
              }}
            />
          </div>

        )
      }

      <Grid container spacing={3}>
        {images.map((image) => (
          <Grid key={image.id} xs={12} sm={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                image={URL.createObjectURL(image.file)}
                alt={image.id}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
