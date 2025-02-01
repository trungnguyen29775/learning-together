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

    const images = [
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
        'https://www.bing.com/th?id=OIP.S1QhrGnesF7vH4QYF9Ne8QHaHa&w=206&h=206&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2',
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
                        <Card
                            sx={{
                                maxWidth: 500,
                                margin: 'auto',
                                overflowY: 'auto',
                                '&:hover': {
                                    cursor: 'pointer',
                                },
                            }}
                        >
                            <CardMedia sx={{ height: 400 }} image={profile.imageUrl} title="green iguana" />
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
                            {/* <CardContent>
                                {images.map((item, index) => {
                                    console.log('Hello');
                                    return <CardMedia sx={{ height: 300 }} image={item} title="green iguana" />;
                                })}
                            </CardContent> */}
                            <CardActions>
                                <Button size="small">Like</Button>
                                <Button size="small">Don't Like</Button>
                            </CardActions>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default TinderCards;
