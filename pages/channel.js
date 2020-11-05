import React from "react";
import Error from "next/error";
import Link from 'next/link';

export default class extends React.Component {
  static async getInitialProps({ query, res }) {
    let idChannel = query.id;

    try {
      let [reqChannel, reqSeries, reqAudios] = await Promise.all([
        fetch(`https://api.audioboom.com/channels/${idChannel}`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`),
        fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`),
      ]);

      if (reqChannel.status >= 400) {
        res.statusCode = reqChannel.status;
        return {
          channel: null,
          audioClips: null,
          series: null,
          statusCode: reqChannel.status,
        };
      }

      let dataChannel = await reqChannel.json();
      let channel = dataChannel.body.channel;

      let dataAudios = await reqAudios.json();
      let audioClips = dataAudios.body.audio_clips;

      let dataSeries = await reqSeries.json();
      let series = dataSeries.body.channels;

      return { channel, audioClips, series, statusCode: 200 };
    } catch (e) {
      return { channel: null, audioClips: null, series: null, statusCode: 503 };
    }
  }

  render() {
    const { channel, audioClips, series, statusCode } = this.props;

    if (statusCode !== 200) {
      return <Error statusCode={statusCode} />;
    }

    return (
      <div>
        <header><Link href="/"><a>Podcasts</a></Link></header>
        <h1>{channel.title}</h1>

        <h2>Series</h2>
        {series.map((serie) => (
          <div>{serie.title}</div>
        ))}

        <h2>Ultimos Podcast</h2>
        {audioClips.map((clip) => (
          <div>{clip.title}</div>
        ))}

        <style jsx>{`
          header {
            color: #fff;
            background: #1ca;
            padding: 15px;
            text-align: center;
          }

          header a {
            color: #fff;
            text-decoration: none;
          }

          .channels {
            display: grid;
            grid-gap: 15px;
            padding: 15px;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          a.channel {
            display: block;
            margin-bottom: 0.5em;
            color: #333;
            text-decoration: none;
          }

          .channel img {
            width: 100%;
          }

          h1 {
            font-weight: 600;
            padding: 15px;
          }

          h2 {
            padding: 5px;
            font-size: 0.9em;
            font-weight: 600;
            margin: 0;
            text-align: center;
          }
        `}</style>

        <style jsx global>{`
          body {
            margin: 0;
            font-family: system-ui;
            background: white;
          }
        `}</style>
      </div>
    );
  }
}
