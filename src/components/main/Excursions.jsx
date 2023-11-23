import './Excursions.scss'
//import stonetown from  '../../assets/images/stonetown/DSC_0431.jpeg'

function Excursions() {
    return (
        <div className="excursions-container">
            <h2>Roaming Retreats</h2>

            <div className="excursions">

                <div className='trips'>
                    <h4 className='stonetown'>Stone Town Heritage Walk</h4>
                    <p>Embark on a journey through the timeless Stone Town, a place where history resonates in every alley. This half-day tour in Western Zanzibar will lead you through landmarks like the enchanting House of Wonders, the Palace Museum (also known as People’s Palace), Dr. Livingston’s House, and the historic Arab Fort, offering a captivating glimpse into the heart of Zanzibar&apos;s heritage.</p>
                </div>

                <div className='trips'>
                    <h4 className='safariblue'>Dhow & Snorkeling Safari Blue</h4>
                    <p>Experience the authentic and unrivaled Safari Blue - a full-day excursion aboard traditional, locally-crafted sailing dhows. This adventure in South Zanzibar is the perfect way to spend your day, offering opportunities to swim, sunbathe, and stroll along serene sandbanks, all while soaking in the breathtaking views</p>
                </div>

                <div className='trips'>
                    <h4 className='spicetour'>Zanzibar Spice & Culture Tour</h4>
                    <p>Embark on a half-day journey through Central Zanzibar, exploring the rich history shaped by cloves, nutmeg, cinnamon, and pepper. These spices, which once attracted the Sultans of Oman, also played a pivotal role in the beginnings of the infamous slave trade, adding layers of history to Zanzibar&apos;s story.</p>

                </div>
            </div>

            <button>More Retreats</button>

        </div>
    )
}

export default Excursions