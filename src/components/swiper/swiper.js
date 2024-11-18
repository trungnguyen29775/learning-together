import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

const TinderCards = () => {
    const profiles = [
        {
            id: 1,
            name: 'Alice',
            age: 25,
            imageUrl:
                'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
            slogan: 'Tôi thích học toán',
        },
        {
            id: 2,
            name: 'Bob',
            age: 28,
            imageUrl:
                'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
            slogan: 'Tôi thích học văn',
        },
        {
            id: 3,
            name: 'Charlie',
            age: 22,
            imageUrl:
                'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
            slogan: 'Tôi thích học hóa',
        },
        {
            id: 4,
            name: 'Daisy',
            age: 27,
            imageUrl:
                'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRa9QlrNDT8NNM4FHaxIYZszOl1y5h6jVnpK06DjySyIm5sEf4J',
            slogan: 'Tôi thích học lý',
        },
    ];

    return (
        <div
            className="tinderCards"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Swiper
                spaceBetween={10}
                slidesPerView={1}
                onSlideChange={(swiper) => console.log('Slide changed to: ', swiper.activeIndex)}
                onSwiper={(swiper) => console.log(swiper)}
            >
                {profiles.map((profile) => (
                    <SwiperSlide key={profile.id}>
                        <Card sx={{ maxWidth: 400, margin: 'auto' }}>
                            <CardMedia sx={{ height: 300 }} image={profile.imageUrl} title="green iguana" />
                            <CardContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography gutterBottom variant="h5" component="div">
                                        Name: {profile.name}
                                    </Typography>
                                    <Typography gutterBottom variant="h6" component="div">
                                        Age: {profile.age}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Slogan: {profile.slogan}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small">Share</Button>
                                <Button size="small">Learn More</Button>
                            </CardActions>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default TinderCards;
